import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser, Check, Loader2 } from 'lucide-react';
import api, { getFileUrl } from '../../services/api';

const SignaturePad = ({ label, onSave, initialData }) => {
    const sigCanvas = useRef({});
    const [isEmpty, setIsEmpty] = useState(true);
    const [savedSignature, setSavedSignature] = useState(initialData || null);
    const [uploading, setUploading] = useState(false);

    // Sync with external updates if any
    useEffect(() => {
        if (initialData) setSavedSignature(initialData);
    }, [initialData]);

    const clear = async () => {
        if (savedSignature) {
            try {
                let filePath = savedSignature;
                if (savedSignature.startsWith('http')) {
                    const urlObj = new URL(savedSignature);
                    filePath = urlObj.pathname;
                }
                await api.delete('/upload', { data: { filePath } });
                console.log("Deleted signature:", filePath);
            } catch (error) {
                console.error("Failed to delete signature", error);
                // Continue clearing UI even if backend fails
            }
        }

        if (sigCanvas.current) {
            sigCanvas.current.clear();
        }
        setIsEmpty(true);
        setSavedSignature(null);
        onSave(null);
    };

    const dataURLtoBlob = (dataURL) => {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };

    const save = async () => {
        if (sigCanvas.current.isEmpty()) return;

        setUploading(true);

        try {
            // Use getCanvas() instead of getTrimmedCanvas() to avoid "trim_canvas.default is not a function" error
            // resulting from Vite/ESM compatibility issues with the underlying library.
            const dataURL = sigCanvas.current.getCanvas().toDataURL('image/png');

            // Convert to file and upload
            const blob = dataURLtoBlob(dataURL);
            const file = new File([blob], "signature.png", { type: "image/png" });
            const formData = new FormData();
            formData.append('image', file);

            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSavedSignature(data.filePath);
            onSave(data.filePath);
        } catch (error) {
            console.error("Signature upload failed", error);
            // Fallback to base64 if upload fails? Or show error?
            // For now, let's just alert
            alert("Failed to save signature. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleBegin = () => {
        setIsEmpty(false);
    };

    if (savedSignature) {
        return (
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
                <div className="relative border-2 border-teal-500 border-dashed rounded-xl bg-teal-50 p-2">
                    <img src={getFileUrl(savedSignature)} alt="Signature" className="h-24 w-full object-contain" />
                    <button
                        onClick={clear}
                        className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-full shadow-sm hover:bg-red-50 transition-colors"
                        title="Clear Signature"
                    >
                        <Eraser className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full text-[10px] font-bold text-teal-700 shadow-sm border border-teal-100">
                        <Check className="h-3 w-3" /> Signed
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={clear}
                        disabled={isEmpty || uploading}
                        className="text-[10px] font-bold text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors flex items-center gap-1"
                    >
                        <Eraser className="h-3 w-3" /> Clear
                    </button>
                </div>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow relative">
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{
                        className: 'w-full h-32 bg-white cursor-crosshair'
                    }}
                    onBegin={handleBegin}
                />
                {!isEmpty && !uploading && (
                    <button
                        type="button"
                        onClick={save}
                        className="absolute bottom-2 right-2 bg-teal-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg hover:bg-teal-700 transition-colors flex items-center gap-1"
                    >
                        <Check className="h-3 w-3" /> Save
                    </button>
                )}
                {uploading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
                        <Loader2 className="h-6 w-6 text-teal-600 animate-spin" />
                    </div>
                )}
                {isEmpty && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-gray-300 text-xs font-medium uppercase tracking-widest opacity-50">
                        Sign Here
                    </div>
                )}
            </div>
            <p className="text-[10px] text-gray-400 text-center">Use mouse or touch to sign</p>
        </div>
    );
};

export default SignaturePad;
