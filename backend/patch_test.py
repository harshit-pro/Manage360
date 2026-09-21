file_path = "/Users/mishraji/Desktop/Business/Manage360Backend/Manage360/backend/src/test/java/com/res/server/backend/service/MembershipServiceTest.java"

with open(file_path, "r") as f:
    content = f.read()

content = content.replace("studentId, 1, 500, PaymentMethod.CASH, \"Renewal\", false\n        );", "studentId, 1, 500, PaymentMethod.CASH, \"Renewal\", false, 0\n        );")

with open(file_path, "w") as f:
    f.write(content)

print("Patched tests successfully")
