# Frontend Development Guide: Problem & Testcase Management

This guide provides technical details for building the Problem Studio and Testcase Management UI.

## 1. Data Models (Mental Model)

The system manages problems across three layers:
1.  **Metadata (`problems` table)**: Basic info like Title, Slug, Time/Memory limits, and Status.
2.  **Core Scripts (`problem_scripts` table)**: Source code for judging (Checker, Validator, Generator, Solution).
3.  **Test Data (Bunny Storage + `testcases` table)**:
    - **Physical Files**: Stored on Bunny Storage (`.in`, `.out` files).
    - **Test Metadata**: Stored in the Database (points, order, subtask grouping).

---

## 2. API Reference

### A. Testcase File Management (Bunny Storage)
**Base URL**: `/api/problems/:problemId/tests/`
**Auth**: Admin token required.

| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **List Files** | `GET` | `/` | Returns an array of files currently on Bunny Storage. |
| **Upload** | `PUT` | `/:fileName` | Uploads a binary file (`multipart/form-data`). Overwrites if exists. |
| **Preview** | `GET` | `/:fileName/preview` | Returns file content as text (Max 512KB). |
| **Download** | `GET` | `/:fileName` | Streams the binary file for download. |
| **Delete** | `DELETE` | `/:target?` | Deletes a specific file or the whole test folder if `:target` is omitted. |

### B. Database Schema (Prisma)
Refer to `schema.prisma` for the following new models:
- `problem_scripts`: Linked 1:1 with `problems`.
- `testcases`: Linked 1:N with `problems`. Used for configuring points and execution order.
- `submissions`: Records of user attempts and judge results.

---

## 3. Data Types (TypeScript for Frontend)

```typescript
export interface StorageFile {
  ObjectName: string; // e.g., "1.in", "1.out"
  Length: number;     // File size in bytes
  LastChanged: string;
}

export interface ProblemScripts {
  checker_code?: string;
  validator_code?: string;
  generator_code?: string;
  solution_code?: string;
}

export interface TestcaseConfig {
  id: string;
  order: number;
  is_sample: boolean;
  points: number;
  input_file_url: string;
  output_file_url: string;
}
```

---

## 4. UI Implementation Strategy

### Component 1: General Info
- Form for basic metadata (`title`, `slug`, `time_limit`, `memory_limit`).
- Selection for `checker_type` (`default_diff` vs `custom_checker`).

### Component 2: Script Editor
- Use a code editor (Monaco/CodeMirror) with C++ highlighting.
- Provide tabs for Checker, Validator, Generator, and Solution code.

### Component 3: Testcase Manager (Crucial)
1.  **Auto-Pairing Logic**: Fetch the list of files from Storage, then match `X.in` with `X.out` to display them as a single "Testcase Row".
2.  **Config Sync**: Use the `testcases` table to store metadata for these pairs.
3.  **Upload Flow**: Allow bulk uploading. Filenames should be used as the `:fileName` parameter in the PUT request.
4.  **Preview Logic**: Fetch preview content only when the user clicks a "View" icon to save bandwidth. Handle errors for files > 512KB.

---

## 5. Development Tasks (Checklist)
- [ ] Implement `testcaseService` to wrap Bunny Storage APIs.
- [ ] Implement `problemScriptService` for CRUD on script data.
- [ ] Create a smart Table component that handles pairing logic.
- [ ] Add bulk delete and bulk upload functionality.
