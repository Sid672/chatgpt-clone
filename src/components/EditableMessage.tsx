"use client";
import { useState } from "react";

type Props = {
  initial: string;
  onSave: (next: string) => void;
};

export default function EditableMessage({ initial, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initial);

  if (!editing) {
    return (
      <div className="group inline-flex items-center gap-2">
        <div className="whitespace-pre-wrap">{initial}</div>
        <button
          className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 border rounded"
          onClick={() => setEditing(true)}
          aria-label="Edit message"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <textarea
        className="w-full border rounded p-2"
        rows={3}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="flex flex-col gap-2">
        <button
          className="px-3 py-2 border rounded"
          onClick={() => {
            setEditing(false);
            if (value !== initial) onSave(value);
          }}
        >
          Save
        </button>
        <button className="px-3 py-2 border rounded" onClick={() => setEditing(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}


