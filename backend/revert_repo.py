import re

file_path = "/Users/mishraji/Desktop/Business/Manage360Backend/Manage360/backend/src/main/java/com/res/server/backend/repository/StudentRepository.java"

with open(file_path, "r") as f:
    content = f.read()

new_query = """    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"membership"})
    @Query(value = \"\"\"
    SELECT s FROM Student s
    WHERE s.library.id = :libraryId
      AND (:isEnrolled IS NULL OR s.isEnrolled = :isEnrolled)
      AND (
           :q IS NULL OR
           LOWER(s.name) LIKE LOWER(CONCAT('%', :q, '%')) OR
           LOWER(s.regNo) LIKE LOWER(CONCAT('%', :q, '%')) OR
           LOWER(s.seatNo) LIKE LOWER(CONCAT('%', :q, '%')) OR
           LOWER(s.mobileNo) LIKE LOWER(CONCAT('%', :q, '%'))
      )
\"\"\")"""

old_query = """    @Query(value = \"\"\"
    SELECT s.* FROM students s
    WHERE s.library_id = :libraryId
      AND (:isEnrolled IS NULL OR s.is_enrolled = :isEnrolled)
      AND (
           :q IS NULL OR
           LOWER(s.name::text) LIKE LOWER(CONCAT('%', :q, '%')) OR
           LOWER(s.reg_no::text) LIKE LOWER(CONCAT('%', :q, '%')) OR
           LOWER(s.seat_no::text) LIKE LOWER(CONCAT('%', :q, '%')) OR
           LOWER(s.mobile_no::text) LIKE LOWER(CONCAT('%', :q, '%'))
      )
\"\"\", nativeQuery = true)"""

new_content = content.replace(new_query, old_query)

with open(file_path, "w") as f:
    f.write(new_content)

print("Reverted repository successfully")
