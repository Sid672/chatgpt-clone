type Props = {
  attachments: { url: string; type: string }[];
};

export default function AttachmentPreview({ attachments }: Props) {
  if (!attachments.length) return null;
  return (
    <div className="flex gap-2 flex-wrap p-2">
      {attachments.map((a, i) => (
        <div key={i} className="border rounded p-1">
          {a.type?.startsWith("image/") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={a.url} alt="attachment" className="h-16 w-16 object-cover rounded" />
          ) : (
            <a className="underline text-sm" href={a.url} target="_blank" rel="noreferrer">
              {a.url.split("/").pop()}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}


