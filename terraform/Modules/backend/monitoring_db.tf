# ---------------------------------------------------------------------------
# Monitoring for the RDS PostgreSQL instance: CloudWatch alarms + dashboard.
# Reuses the SNS topic (local.alarm_actions) and data.aws_region.current from monitoring.tf.
#
# Cost notes (us-east-1): basic RDS metrics are free. Standard alarms are free for the first 10 per
# account; monitoring.tf already has 6, and this file adds 4, so the total stays at the free limit.
# The first 3 dashboards are free (this is the 2nd one). Logs Insights queries are billed per GB scanned.
# ---------------------------------------------------------------------------

locals {
  db_id        = module.db.db_instance_identifier
  db_log_group = "/aws/rds/instance/${module.db.db_instance_identifier}/postgresql" # created by the RDS module
}

# --- Alarms -----------------------------------------------------------------

# Sustained high CPU. A db.t3.micro is a burstable instance: once its CPU credits run out it is throttled.
resource "aws_cloudwatch_metric_alarm" "db_cpu_high" {
  alarm_name          = "ecommerce-db-cpu-high"
  alarm_description   = "RDS CPU above 80% for 15 minutes"
  namespace           = "AWS/RDS"
  metric_name         = "CPUUtilization"
  dimensions          = { DBInstanceIdentifier = local.db_id }
  statistic           = "Average"
  period              = 300
  evaluation_periods  = 3
  comparison_operator = "GreaterThanThreshold"
  threshold           = 80
  treat_missing_data  = "missing"
  alarm_actions       = local.alarm_actions
}

# The disk is 20 GiB and does not grow by itself; a full disk makes Postgres stop accepting writes.
resource "aws_cloudwatch_metric_alarm" "db_free_storage_low" {
  alarm_name          = "ecommerce-db-free-storage-low"
  alarm_description   = "Less than 2 GiB of free storage left on the 20 GiB volume"
  namespace           = "AWS/RDS"
  metric_name         = "FreeStorageSpace"
  dimensions          = { DBInstanceIdentifier = local.db_id }
  statistic           = "Minimum"
  period              = 300
  evaluation_periods  = 1
  comparison_operator = "LessThanThreshold"
  threshold           = 2 * 1024 * 1024 * 1024 # bytes
  treat_missing_data  = "missing"
  alarm_actions       = local.alarm_actions
}

# The instance has 1 GiB RAM in total. Very low freeable memory means swapping or the OOM killer.
# If this alarm flaps on an idle database, lower the threshold.
resource "aws_cloudwatch_metric_alarm" "db_freeable_memory_low" {
  alarm_name          = "ecommerce-db-freeable-memory-low"
  alarm_description   = "Less than 100 MiB of freeable memory for 15 minutes"
  namespace           = "AWS/RDS"
  metric_name         = "FreeableMemory"
  dimensions          = { DBInstanceIdentifier = local.db_id }
  statistic           = "Average"
  period              = 300
  evaluation_periods  = 3
  comparison_operator = "LessThanThreshold"
  threshold           = 100 * 1024 * 1024 # bytes
  treat_missing_data  = "missing"
  alarm_actions       = local.alarm_actions
}

# Postgres allows roughly 80-110 connections on 1 GiB of RAM (max_connections is derived from memory).
# Django keeps connections open for 10 minutes (CONN_MAX_AGE=600), so a leak shows up here first.
resource "aws_cloudwatch_metric_alarm" "db_connections_high" {
  alarm_name          = "ecommerce-db-connections-high"
  alarm_description   = "More than 60 open database connections for 10 minutes"
  namespace           = "AWS/RDS"
  metric_name         = "DatabaseConnections"
  dimensions          = { DBInstanceIdentifier = local.db_id }
  statistic           = "Maximum"
  period              = 300
  evaluation_periods  = 2
  comparison_operator = "GreaterThanThreshold"
  threshold           = 60
  treat_missing_data  = "missing"
  alarm_actions       = local.alarm_actions
}

# --- Dashboard --------------------------------------------------------------

resource "aws_cloudwatch_dashboard" "database" {
  dashboard_name = "ecommerce-database"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric", x = 0, y = 0, width = 8, height = 6
        properties = {
          title  = "CPU utilization (%)"
          region = data.aws_region.current.region
          stat   = "Average"
          period = 60
          yAxis  = { left = { min = 0, max = 100 } }
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", local.db_id],
          ]
          annotations = { horizontal = [{ label = "Alarm", value = 80 }] }
        }
      },
      {
        type = "metric", x = 8, y = 0, width = 8, height = 6
        properties = {
          title  = "Database connections"
          region = data.aws_region.current.region
          stat   = "Maximum"
          period = 60
          metrics = [
            ["AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", local.db_id],
          ]
          annotations = { horizontal = [{ label = "Alarm", value = 60 }] }
        }
      },
      {
        type = "metric", x = 16, y = 0, width = 8, height = 6
        properties = {
          title  = "Free storage (GiB)"
          region = data.aws_region.current.region
          period = 300
          metrics = [
            [{ expression = "m1 / 1024 / 1024 / 1024", label = "Free storage (GiB)", id = "e1" }],
            ["AWS/RDS", "FreeStorageSpace", "DBInstanceIdentifier", local.db_id, { id = "m1", stat = "Minimum", visible = false }],
          ]
          annotations = { horizontal = [{ label = "Alarm", value = 2 }] }
        }
      },
      {
        type = "metric", x = 0, y = 6, width = 8, height = 6
        properties = {
          title  = "Freeable memory (MiB)"
          region = data.aws_region.current.region
          period = 60
          metrics = [
            [{ expression = "m1 / 1024 / 1024", label = "Freeable memory (MiB)", id = "e1" }],
            ["AWS/RDS", "FreeableMemory", "DBInstanceIdentifier", local.db_id, { id = "m1", stat = "Average", visible = false }],
          ]
          annotations = { horizontal = [{ label = "Alarm", value = 100 }] }
        }
      },
      {
        type = "metric", x = 8, y = 6, width = 8, height = 6
        properties = {
          title  = "Read / write IOPS"
          region = data.aws_region.current.region
          stat   = "Average"
          period = 60
          metrics = [
            ["AWS/RDS", "ReadIOPS", "DBInstanceIdentifier", local.db_id],
            [".", "WriteIOPS", ".", "."],
          ]
        }
      },
      {
        type = "metric", x = 16, y = 6, width = 8, height = 6
        properties = {
          title  = "Read / write latency (seconds)"
          region = data.aws_region.current.region
          stat   = "Average"
          period = 60
          metrics = [
            ["AWS/RDS", "ReadLatency", "DBInstanceIdentifier", local.db_id],
            [".", "WriteLatency", ".", "."],
          ]
        }
      },
      {
        type = "log", x = 0, y = 12, width = 24, height = 6
        properties = {
          title  = "Recent PostgreSQL errors"
          region = data.aws_region.current.region
          view   = "table"
          query  = "SOURCE '${local.db_log_group}' | fields @timestamp, @message | filter @message like /ERROR|FATAL|PANIC/ | sort @timestamp desc | limit 20"
        }
      },
    ]
  })
}
