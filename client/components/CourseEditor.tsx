"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function CourseEditor({ onChange, value }: { onChange: (val: string) => void; value: string }) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"]
    ],
  };

  return (
    <div>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder="Write your course content here..."
        style={{ height: "400px", marginBottom: "20px" }}
      />
    </div>
  );
}
