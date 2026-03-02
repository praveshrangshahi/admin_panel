
import React, { useState, useRef } from 'react';
import { Upload, X, Check, Loader2, AlertCircle, RefreshCw, CloudUpload } from 'lucide-react';
import { cn } from "@/lib/utils";
import api, { getFileUrl } from '../../services/api';
import imageCompression from 'browser-image-compression';

const ImageUpload = ({ value, onChange, label, className, onUploadStatusChange }) => {
    // If value is a string (URL or path), show it. If empty, show placeholder.
    const [preview, setPreview] = useState(getFileUrl(value));
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null); // New: Track selected file for confirmation
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setError(null);
        setUploading(true);
        if (onUploadStatusChange) onUploadStatusChange(true);

        try {
            const options = {
                maxSizeMB: 0.5, // 500KB max
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, options);

            // Create local preview immediately
            const objectUrl = URL.createObjectURL(compressedFile);
            setPreview(objectUrl);
            setSelectedFile(compressedFile);
        } catch (err) {
            console.error("Compression error:", err);
            setError("Image processing failed");
        } finally {
            setUploading(false);
            if (onUploadStatusChange) onUploadStatusChange(false);
            e.target.value = '';
        }
    };

    const confirmUpload = async (e) => {
        e.stopPropagation();
        if (!selectedFile) return;

        setUploading(true);
        if (onUploadStatusChange) onUploadStatusChange(true);

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Success
            onChange(data.filePath);
            setSelectedFile(null); // Clear selected file as it is now uploaded
        } catch (err) {
            console.error("Upload failed", err);
            setError("Upload failed");
        } finally {
            setUploading(false);
            if (onUploadStatusChange) onUploadStatusChange(false);
        }
    };

    const handleRemove = async (e) => {
        e.stopPropagation();

        // If there's a uploaded server URL, delete it from backend
        if (value) {
            try {
                let filePath = value;
                if (value.startsWith('http')) {
                    try {
                        const urlObj = new URL(value);
                        filePath = urlObj.pathname;
                    } catch (e) {
                        console.error("Invalid URL in value", value);
                    }
                }

                await api.delete('/upload', { data: { filePath } });
                console.log("Deleted file:", filePath);
            } catch (err) {
                console.error("Failed to delete file from server", err);
                // We typically still want to clear the UI even if backend delete fails, 
                // but maybe log it or show a toast. For now, proceeding to clear UI.
            }
        }

        setPreview('');
        onChange('');
        setError(null);
        setSelectedFile(null);
        if (onUploadStatusChange && uploading) onUploadStatusChange(false); // Reset status if removing during upload
        setUploading(false);
    };

    const handleRetry = (e) => {
        e.stopPropagation();
        // If we have the file, retry upload. Else trigger select.
        if (selectedFile) {
            confirmUpload(e);
        } else {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className={cn("space-y-2", className)}>
            {label && <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">{label}</label>}

            <div
                onClick={() => (!uploading && !selectedFile && !value) && fileInputRef.current?.click()}
                className={cn(
                    "relative group cursor-pointer border-2 border-dashed rounded-xl transition-all duration-300 overflow-hidden bg-gray-50 hover:bg-white",
                    error ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-teal-400",
                    preview ? "h-32 border-solid border-gray-200" : "h-24 py-4 flex flex-col items-center justify-center gap-2",
                    uploading && "pointer-events-none opacity-80"
                )}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                />

                {preview ? (
                    <>
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />

                        {/* Overlay Actions */}
                        <div className={cn("absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center gap-2",
                            (uploading || selectedFile) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}>
                            {/* Wait for Confirmation State */}
                            {selectedFile && !uploading && !error && (
                                <div className="flex flex-col items-center gap-2">
                                    <button
                                        onClick={confirmUpload}
                                        className="h-10 w-10 bg-teal-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-teal-600 hover:scale-110 transition-all animate-bounce-subtle"
                                        title="Start Upload"
                                    >
                                        <CloudUpload className="h-5 w-5" />
                                    </button>
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-black/50 px-2 py-0.5 rounded-full">Confirm Upload</span>
                                </div>
                            )}

                            {/* Remove Button (Always available unless uploading) */}
                            {!uploading && (
                                <button
                                    onClick={handleRemove}
                                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-red-50 text-red-500 transition-colors shadow-sm"
                                    title="Remove"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Uploading State */}
                        {uploading && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-[2px]">
                                <Loader2 className="h-8 w-8 text-teal-400 animate-spin mb-2" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider animate-pulse">Uploading...</span>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="absolute inset-0 bg-red-50/90 flex flex-col items-center justify-center backdrop-blur-[1px] p-2 text-center">
                                <AlertCircle className="h-5 w-5 text-red-500 mb-1" />
                                <span className="text-[10px] font-bold text-red-600">Upload Failed</span>
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={handleRetry}
                                        className="px-3 py-1 bg-white border border-red-200 rounded-full text-[10px] font-bold text-red-600 hover:bg-red-50 flex items-center gap-1 shadow-sm"
                                    >
                                        <RefreshCw className="h-3 w-3" /> Retry
                                    </button>
                                    <button
                                        onClick={handleRemove}
                                        className="px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-500 hover:bg-gray-50 flex items-center gap-1 shadow-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Success State (Uploaded & No Error & No Pending File) */}
                        {!uploading && !error && !selectedFile && value && (
                            <div className="absolute bottom-2 right-2 h-6 w-6 bg-teal-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                <Check className="h-3.5 w-3.5 text-white" />
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="h-8 w-8 rounded-full bg-teal-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload className="h-4 w-4 text-teal-600" />
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 group-hover:text-teal-600 transition-colors">Click to Select</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ImageUpload;
