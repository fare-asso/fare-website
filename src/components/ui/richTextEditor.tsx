import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

import { DeltaStatic, Sources } from "quill";

import { UnprivilegedEditor } from "react-quill";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const modules = {
    toolbar: [
        [{ header: "1" }, { header: "2" }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ color: [] }, { font: [] }],
        [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
        ],
        ["link", "image"],
    ],
};

export default function RichTextEditor(
    {
        value,
        onChange,
    }: {
        value: string | DeltaStatic;
        onChange: (
            value: string,
            delta: DeltaStatic,
            source: Sources,
            editor: UnprivilegedEditor,
        ) => void;
    },
    ref: any,
) {
    return (
        <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            className="[&_.ql-container]:max-h-72 [&_.ql-container]:overflow-auto [&_.ql-container]:rounded-b-md [&_.ql-editor]:min-h-40 [&_.ql-toolbar]:rounded-t-md [&_img]:max-h-36"
        />
    );
}
