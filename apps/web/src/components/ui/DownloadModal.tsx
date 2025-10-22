interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  screenshotUrl?: string;
  htmlUrl?: string;
}

export function DownloadModal({
  isOpen,
  onClose,
  screenshotUrl,
  htmlUrl,
}: DownloadModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-white border-4 border-black p-8 max-w-lg w-full mx-4">
        <h2 className="text-2xl font-bold mb-6">Download Files</h2>

        <div className="space-y-4 mb-6">
          {screenshotUrl ? (
            <div>
              <p className="text-sm font-bold mb-2">Screenshot:</p>
              <a
                href={screenshotUrl}
                download
                className="block px-4 py-2 bg-blue-500 text-white text-center hover:bg-blue-600"
              >
                Download Screenshot
              </a>
            </div>
          ) : (
            <div>
              <p className="text-sm font-bold mb-2">Screenshot:</p>
              <p className="text-gray-500 text-sm">No screenshot available</p>
            </div>
          )}

          {htmlUrl ? (
            <div>
              <p className="text-sm font-bold mb-2">HTML Page:</p>
              <a
                href={htmlUrl}
                download
                className="block px-4 py-2 bg-green-500 text-white text-center hover:bg-green-600"
              >
                Download HTML
              </a>
            </div>
          ) : (
            <div>
              <p className="text-sm font-bold mb-2">HTML Page:</p>
              <p className="text-gray-500 text-sm">No HTML file available</p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-black text-white font-bold hover:bg-gray-900"
        >
          Close
        </button>
      </div>
    </div>
  );
}
