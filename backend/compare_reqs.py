import sys

def compare_requirements(file1, file2):
    with open(file1, "r") as f1, open(file2, "r") as f2:
        req1 = {line.strip() for line in f1 if line.strip() and not line.startswith("#")}
        req2 = {line.strip() for line in f2 if line.strip() and not line.startswith("#")}

    missing_in_file1 = req2 - req1
    missing_in_file2 = req1 - req2

    return missing_in_file1, missing_in_file2


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python compare_reqs.py <file1> <file2>")
        sys.exit(1)

    file1, file2 = sys.argv[1], sys.argv[2]

    missing_in_file1, missing_in_file2 = compare_requirements(file1, file2)

    print(f"\n📂 Missing in {file1}:")
    if missing_in_file1:
        for pkg in missing_in_file1:
            print("  -", pkg)
        print("\n👉 Install with:")
        print("pip install " + " ".join(missing_in_file1))
    else:
        print("  Nothing missing ✅")

    print(f"\n📂 Missing in {file2}:")
    if missing_in_file2:
        for pkg in missing_in_file2:
            print("  -", pkg)
        print("\n👉 Install with:")
        print("pip install " + " ".join(missing_in_file2))
    else:
        print("  Nothing missing ✅")


# Example usage:
# # python compare_reqs.py requirements.txt requirements-dev.txt