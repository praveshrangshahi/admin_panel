import React, { useState, useEffect } from 'react';
import {
    X, Car, Briefcase, AlertCircle, CheckCircle2, FileText, ChevronRight, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import ImageUpload from "../ui/ImageUpload";
import SignaturePad from "../ui/SignaturePad";

const VehicleEntryModal = ({ isOpen, onClose, onSubmit, formData, setFormData, editMode, clients, loading, user, yards }) => {
    const [step, setStep] = useState(1);
    const [uploadingCount, setUploadingCount] = useState(0);
    const [error, setError] = useState(null);

    const handleUploadStatus = (isUploading) => {
        setUploadingCount(prev => isUploading ? prev + 1 : Math.max(0, prev - 1));
    };

    // Reset error when step changes or form data changes
    useEffect(() => {
        if (error) setError(null);
    }, [step, formData]);

    if (!isOpen) return null;

    const steps = [
        { id: 1, title: "Basic Info", icon: Car },
        { id: 2, title: "Images", icon: FileText },
        { id: 3, title: "Repo Details", icon: Briefcase },
        { id: 4, title: "Condition", icon: AlertCircle },
        { id: 5, title: "Accessories", icon: CheckCircle2 },
        { id: 6, title: "Signatures", icon: CheckCircle2 },
        { id: 7, title: "Summary", icon: FileText }
    ];

    const validateForm = () => {
        const { licensePlate, make, model, clientId, repoAgent, repoDate, photos } = formData;
        const errors = [];

        if (!licensePlate?.trim()) errors.push("License Plate is required");
        if (!make?.trim()) errors.push("Make is required");
        if (!model?.trim()) errors.push("Model is required");
        if (!clientId) errors.push("Client is required");
        if (!repoAgent?.trim()) errors.push("Repo Agent Name is required");
        if (!repoDate) errors.push("Repo Date is required");
        if (!photos?.agentSignature && !photos?.yardStaffSignature) errors.push("At least one signature is required");

        return errors;
    };

    const handleNext = () => {
        setStep(Math.min(step + 1, steps.length));
    };

    const handleFinalSubmit = () => {
        const errors = validateForm();
        if (errors.length > 0) {
            setError(errors.join(", "));
            return;
        }
        onSubmit();
    };

    const handlePrev = () => setStep(Math.max(step - 1, 1));

    const renderStepContent = () => {
        switch (step) {
            case 1: // Basic Info
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Branch Selection for Super Admin */}
                        {user?.role === 'SUPER_ADMIN' && (
                            <div className="md:col-span-2 bg-amber-50 p-4 rounded-xl border border-amber-100 mb-2">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-amber-800 uppercase tracking-wider">Assign Branch *</label>
                                    {editMode && (
                                        <span className="text-[10px] font-bold text-amber-600 bg-white px-2 py-0.5 rounded-full border border-amber-200">
                                            Locked
                                        </span>
                                    )}
                                </div>
                                <select
                                    value={formData.branchId}
                                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                    disabled={editMode}
                                    className={cn(
                                        "input-field bg-white border-amber-200 focus:border-amber-400 focus:ring-amber-500/20",
                                        editMode && "opacity-60 cursor-not-allowed bg-gray-100"
                                    )}
                                >
                                    <option value="">Select Branch</option>
                                    {yards.map(yard => (
                                        <option key={yard._id} value={yard._id}>{yard.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="md:col-span-2"><h4 className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-2">Vehicle Identity</h4></div>
                        <input required placeholder="License Plate *" value={formData.licensePlate} onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })} className="input-field" />
                        <div className="grid grid-cols-2 gap-2">
                            <input required placeholder="Make *" value={formData.make} onChange={(e) => setFormData({ ...formData, make: e.target.value })} className="input-field" />
                            <input required placeholder="Model *" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="input-field" />
                        </div>
                        <input placeholder="Variant" value={formData.variant} onChange={(e) => setFormData({ ...formData, variant: e.target.value })} className="input-field" />
                        <input placeholder="Color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="input-field" />
                        <input placeholder="VIN" value={formData.vin} onChange={(e) => setFormData({ ...formData, vin: e.target.value })} className="input-field" />
                        <input placeholder="Engine Number" value={formData.engineNumber} onChange={(e) => setFormData({ ...formData, engineNumber: e.target.value })} className="input-field" />
                        <input placeholder="Chassis Number" value={formData.chassisNumber} onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value })} className="input-field" />
                        <input type="number" placeholder="Mfg Year" value={formData.manufacturingYear} onChange={(e) => setFormData({ ...formData, manufacturingYear: e.target.value })} className="input-field" />
                        <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-field">
                            <option value="">Category</option>
                            <option value="2W">2 Wheeler</option>
                            <option value="3W">3 Wheeler</option>
                            <option value="4W">4 Wheeler</option>
                            <option value="CV">Commercial Vehicle</option>
                            <option value="FE">Farm Equipment</option>
                        </select>

                        <div className="md:col-span-2 mt-4"><h4 className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-2">Contract Info</h4></div>
                        <select required value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} className="input-field">
                            <option value="">Select Client *</option>
                            {clients.map(c => <option key={c._id} value={c._id}>{c.matchName}</option>)}
                        </select>
                        <input placeholder="Contract Number" value={formData.contractNumber} onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })} className="input-field" />
                        <input placeholder="Borrower Name" value={formData.borrowerName} onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })} className="input-field" />
                        <input placeholder="Borrower Contact" value={formData.customerContactNumber} onChange={(e) => setFormData({ ...formData, customerContactNumber: e.target.value })} className="input-field" />
                    </div>
                );
            case 2: // Images (Moved Up)
                return (
                    <div className="space-y-4">
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-2">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-amber-500" />
                                    <h4 className="text-sm font-bold text-amber-800">Vehicle Photos</h4>
                                </div>
                                <p className="text-xs font-medium text-amber-700">
                                    Upload photos directly. You can continue filling other details while images upload in the background.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="md:col-span-2"><h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Exterior</h4></div>
                            <ImageUpload label="Front View" value={formData.photos?.front} onChange={(url) => setFormData({ ...formData, photos: { ...formData.photos, front: url } })} onUploadStatusChange={handleUploadStatus} />
                            <ImageUpload label="Back View" value={formData.photos?.back} onChange={(url) => setFormData({ ...formData, photos: { ...formData.photos, back: url } })} onUploadStatusChange={handleUploadStatus} />
                            <ImageUpload label="Left View" value={formData.photos?.left} onChange={(url) => setFormData({ ...formData, photos: { ...formData.photos, left: url } })} onUploadStatusChange={handleUploadStatus} />
                            <ImageUpload label="Right View" value={formData.photos?.right} onChange={(url) => setFormData({ ...formData, photos: { ...formData.photos, right: url } })} onUploadStatusChange={handleUploadStatus} />
                            <ImageUpload label="Right Tyres" value={formData.photos?.rightTyres?.[0]} onChange={(url) => setFormData({ ...formData, photos: { ...formData.photos, rightTyres: [url] } })} onUploadStatusChange={handleUploadStatus} />
                            <ImageUpload label="Left Tyres" value={formData.photos?.leftTyres?.[0]} onChange={(url) => setFormData({ ...formData, photos: { ...formData.photos, leftTyres: [url] } })} onUploadStatusChange={handleUploadStatus} />

                            <div className="md:col-span-2"><h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 mt-2">Interior & Mechanical</h4></div>
                            <ImageUpload label="Interior View" value={formData.photos?.interior} onChange={(url) => setFormData({ ...formData, photos: { ...formData.photos, interior: url } })} onUploadStatusChange={handleUploadStatus} />
                            <ImageUpload label="Odometer" value={formData.photos?.odometer} onChange={(url) => setFormData({ ...formData, photos: { ...formData.photos, odometer: url } })} onUploadStatusChange={handleUploadStatus} />
                            <ImageUpload label="Engine View" value={formData.photos?.engine} onChange={(url) => setFormData({ ...formData, photos: { ...formData.photos, engine: url } })} onUploadStatusChange={handleUploadStatus} />
                            <ImageUpload label="Chassis" value={formData.photos?.chassis} onChange={(url) => setFormData({ ...formData, photos: { ...formData.photos, chassis: url } })} onUploadStatusChange={handleUploadStatus} />
                            <ImageUpload label="Chassis Two" value={formData.photos?.chassisTwo} onChange={(url) => setFormData({ ...formData, photos: { ...formData.photos, chassisTwo: url } })} onUploadStatusChange={handleUploadStatus} />

                            <div className="md:col-span-2"><h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 mt-2">Documentation & Proofs</h4></div>
                            <ImageUpload label="Registration Paper (RC)" value={formData.photos?.rcBlob} onChange={(url) => setFormData({ ...formData, photos: { ...formData.photos, rcBlob: url } })} onUploadStatusChange={handleUploadStatus} />
                            <ImageUpload label="Insurance Paper" value={formData.photos?.insuranceBlob} onChange={(url) => setFormData({ ...formData, photos: { ...formData.photos, insuranceBlob: url } })} onUploadStatusChange={handleUploadStatus} />
                            <ImageUpload label="Surrender Letter" value={formData.photos?.surrenderLetter} onChange={(url) => setFormData({ ...formData, photos: { ...formData.photos, surrenderLetter: url } })} onUploadStatusChange={handleUploadStatus} />
                            <ImageUpload label="Client Auth Letter" value={formData.photos?.authLetter} onChange={(url) => setFormData({ ...formData, photos: { ...formData.photos, authLetter: url } })} onUploadStatusChange={handleUploadStatus} />
                            <ImageUpload label="Agent Proof" value={formData.photos?.agentProof} onChange={(url) => setFormData({ ...formData, photos: { ...formData.photos, agentProof: url } })} onUploadStatusChange={handleUploadStatus} />
                            <ImageUpload label="Pre-Police Intimation" value={formData.photos?.prePoliceIntimation} onChange={(url) => setFormData({ ...formData, photos: { ...formData.photos, prePoliceIntimation: url } })} onUploadStatusChange={handleUploadStatus} />
                            <ImageUpload label="Post-Police Intimation" value={formData.photos?.postPoliceIntimation} onChange={(url) => setFormData({ ...formData, photos: { ...formData.photos, postPoliceIntimation: url } })} onUploadStatusChange={handleUploadStatus} />
                        </div>
                    </div>
                );
            case 3: // Repo Details (Moved from 2)
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input placeholder="Repo Agent Name" value={formData.repoAgent} onChange={(e) => setFormData({ ...formData, repoAgent: e.target.value })} className="input-field" />

                        <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.inHouseAgent || false} onChange={(e) => setFormData({ ...formData, inHouseAgent: e.target.checked })} className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500" />
                                <span className="font-bold text-gray-700 text-sm">In-House Agent?</span>
                            </label>
                        </div>

                        <select value={formData.repoType} onChange={(e) => setFormData({ ...formData, repoType: e.target.value })} className="input-field">
                            <option value="">Repo Type</option>
                            <option value="INVENTORY">INVENTORY</option>
                            <option value="Valuation">Valuation</option>
                            <option value="Surrender">Surrender</option>
                            <option value="Takeover">Takeover</option>
                        </select>
                        <input placeholder="Bank Name (if external)" value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} className="input-field" />
                        <input type="date" placeholder="Repo Date" value={formData.repoDate ? new Date(formData.repoDate).toISOString().split('T')[0] : ''} onChange={(e) => setFormData({ ...formData, repoDate: e.target.value })} className="input-field" />

                        <select value={formData.agentProof} onChange={(e) => setFormData({ ...formData, agentProof: e.target.value })} className="input-field">
                            <option value="">Agent Proof Type</option>
                            <option value="Aadhar Card">Aadhar Card</option>
                            <option value="Voter ID">Voter ID</option>
                            <option value="Driving License">Driving License</option>
                            <option value="ID Card">ID Card</option>
                        </select>
                        <input placeholder="Proof Number" value={formData.proofNumber} onChange={(e) => setFormData({ ...formData, proofNumber: e.target.value })} className="input-field" />

                        <textarea placeholder="Repo Agency Details" value={formData.repAgencyDetails} onChange={(e) => setFormData({ ...formData, repAgencyDetails: e.target.value })} className="input-field md:col-span-2 min-h-[80px]" />
                    </div>
                );
            case 4: // Condition (Moved from 3)
                return (
                    <div className="space-y-4">
                        <div className="md:col-span-2"><h4 className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-2">Physical Condition</h4></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label-text">Exterior Condition</label>
                                <select value={formData.condition?.exterior || ''} onChange={(e) => setFormData({ ...formData, condition: { ...formData.condition, exterior: e.target.value } })} className="input-field">
                                    <option value="">Select...</option>
                                    <option value="Good">Good</option>
                                    <option value="Average">Average</option>
                                    <option value="Poor">Poor</option>
                                    <option value="Damaged">Damaged</option>
                                    <option value="Missing">Missing</option>
                                </select>
                            </div>
                            <div>
                                <label className="label-text">Interior Condition</label>
                                <select value={formData.condition?.interior || ''} onChange={(e) => setFormData({ ...formData, condition: { ...formData.condition, interior: e.target.value } })} className="input-field">
                                    <option value="">Select...</option>
                                    <option value="Good">Good</option>
                                    <option value="Average">Average</option>
                                    <option value="Poor">Poor</option>
                                    <option value="Damaged">Damaged</option>
                                    <option value="Missing">Missing</option>
                                </select>
                            </div>
                            <div>
                                <label className="label-text">Starting Condition</label>
                                <select value={formData.condition?.startingCondition || ''} onChange={(e) => setFormData({ ...formData, condition: { ...formData.condition, startingCondition: e.target.value } })} className="input-field">
                                    <option value="">Select...</option>
                                    <option value="Starts">Starts</option>
                                    <option value="Does Not Start">Does Not Start</option>
                                    <option value="Jam">Jam</option>
                                    <option value="Key Missing">Key Missing</option>
                                    <option value="Tochan">Tochan</option>
                                </select>
                            </div>
                            <div>
                                <label className="label-text">Engine Starts?</label>
                                <select value={formData.condition?.starts ? "Yes" : "No"} onChange={(e) => setFormData({ ...formData, condition: { ...formData.condition, starts: e.target.value === "Yes" } })} className="input-field">
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder="Odometer Reading" value={formData.condition?.odometer || ''} onChange={(e) => setFormData({ ...formData, condition: { ...formData.condition, odometer: e.target.value } })} className="input-field" />
                            <input placeholder="Battery Status" value={formData.condition?.battery || ''} onChange={(e) => setFormData({ ...formData, condition: { ...formData.condition, battery: e.target.value } })} className="input-field" />
                            <input placeholder="Battery Make" value={formData.condition?.batteryMake || ''} onChange={(e) => setFormData({ ...formData, condition: { ...formData.condition, batteryMake: e.target.value } })} className="input-field" />
                            <input placeholder="Battery Brand/Model" value={formData.condition?.batteryBrandModel || ''} onChange={(e) => setFormData({ ...formData, condition: { ...formData.condition, batteryBrandModel: e.target.value } })} className="input-field" />
                        </div>

                        <textarea placeholder="General Damage Report / Remarks" value={formData.damageReport} onChange={(e) => setFormData({ ...formData, damageReport: e.target.value })} className="input-field w-full min-h-[60px]" />

                        <div className="md:col-span-2 mt-4"><h4 className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-2">Tyre Details</h4></div>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder="No. of Axles" value={formData.tyreDetails?.noOfAxles || ''} onChange={(e) => setFormData({ ...formData, tyreDetails: { ...formData.tyreDetails, noOfAxles: Number(e.target.value) } })} className="input-field" />
                            <input type="number" placeholder="No. of Tyres" value={formData.tyreDetails?.noOfTyres || ''} onChange={(e) => setFormData({ ...formData, tyreDetails: { ...formData.tyreDetails, noOfTyres: Number(e.target.value) } })} className="input-field" />
                            <input placeholder="Tyre Make" value={formData.tyreDetails?.tyreMake || ''} onChange={(e) => setFormData({ ...formData, tyreDetails: { ...formData.tyreDetails, tyreMake: e.target.value } })} className="input-field" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {['frontRight', 'frontLeft', 'rearRight', 'rearLeft'].map(pos => (
                                <select key={pos} value={formData.tyreDetails?.[pos] || ''} onChange={(e) => setFormData({ ...formData, tyreDetails: { ...formData.tyreDetails, [pos]: e.target.value } })} className="input-field">
                                    <option value="">{pos.replace(/([A-Z])/g, ' $1').trim()} Condition</option>
                                    <option value="Good">Good</option>
                                    <option value="Average">Average</option>
                                    <option value="Worn Out">Worn Out</option>
                                    <option value="Burst">Burst</option>
                                    <option value="Missing">Missing</option>
                                </select>
                            ))}
                        </div>
                    </div>
                );
            case 5: // Accessories
                const ACCESSORIES = ['originalRC', 'registrationPaperAvailable', 'duplicateKeys', 'originalKeys', 'battery', 'jack', 'toolKit', 'wheelSpanner', 'spareWheel', 'stereo', 'ac', 'sideMirrors', 'tami', 'tirpal', 'rassi'];
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {ACCESSORIES.map(acc => (
                                <label key={acc} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-white border border-gray-100 rounded-xl cursor-pointer transition-all hover:shadow-sm">
                                    <input
                                        type="checkbox"
                                        checked={formData.accessories?.[acc] || false}
                                        onChange={(e) => setFormData({ ...formData, accessories: { ...formData.accessories, [acc]: e.target.checked } })}
                                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-xs font-bold text-gray-600 capitalize">{acc.replace(/([A-Z])/g, ' $1').trim()}</span>
                                </label>
                            ))}
                        </div>
                        <input placeholder="Insurance Policy Number" value={formData.accessories?.insurancePolicyNumber || ''} onChange={(e) => setFormData({ ...formData, accessories: { ...formData.accessories, insurancePolicyNumber: e.target.value } })} className="input-field" />
                    </div>
                );
            case 6: // Signatures
                return (
                    <div className="space-y-6">
                        <div className="p-4 bg-teal-50 rounded-xl border border-teal-100 flex gap-2">
                            <CheckCircle2 className="h-5 w-5 text-teal-600" />
                            <p className="text-xs font-medium text-teal-800">Please sign below to complete the vehicle entry process. These signatures will be saved as part of the vehicle record.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <SignaturePad
                                label="Repo Agent Signature"
                                initialData={formData.photos?.agentSignature}
                                onSave={(data) => setFormData({ ...formData, photos: { ...formData.photos, agentSignature: data } })}
                            />
                            <SignaturePad
                                label="Yard Staff / Operator Signature"
                                initialData={formData.photos?.yardStaffSignature}
                                onSave={(data) => setFormData({ ...formData, photos: { ...formData.photos, yardStaffSignature: data } })}
                            />
                        </div>
                    </div>
                );
            case 7: // Summary
                return (
                    <div className="space-y-6">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex gap-2">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <div>
                                <h4 className="text-sm font-bold text-gray-800">Review Entry</h4>
                                <p className="text-xs font-medium text-gray-500">Please review all details before submitting. Click 'Back' to make changes.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div className="space-y-4">
                                <div><h5 className="font-bold text-teal-600 uppercase text-xs">Vehicle Identity</h5></div>
                                <div className="grid grid-cols-2 gap-2">
                                    <span className="text-gray-500">License Plate:</span> <span className="font-bold">{formData.licensePlate}</span>
                                    <span className="text-gray-500">Make/Model:</span> <span className="font-bold">{formData.make} {formData.model}</span>
                                    <span className="text-gray-500">VIN:</span> <span className="font-bold">{formData.vin}</span>
                                    <span className="text-gray-500">Client:</span> <span className="font-bold">{clients.find(c => c._id === formData.clientId)?.matchName || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div><h5 className="font-bold text-teal-600 uppercase text-xs">Repo Details</h5></div>
                                <div className="grid grid-cols-2 gap-2">
                                    <span className="text-gray-500">Repo Agent:</span> <span className="font-bold">{formData.repoAgent}</span>
                                    <span className="text-gray-500">Date:</span> <span className="font-bold">{formData.repoDate}</span>
                                    <span className="text-gray-500">Type:</span> <span className="font-bold">{formData.repoType}</span>
                                </div>
                            </div>

                            <div className="space-y-4 md:col-span-2">
                                <div><h5 className="font-bold text-teal-600 uppercase text-xs">Condition & Photos</h5></div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <span className="block text-xs text-gray-400">Exterior</span>
                                        <span className="font-bold text-gray-700">{formData.condition?.exterior || 'N/A'}</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <span className="block text-xs text-gray-400">Interior</span>
                                        <span className="font-bold text-gray-700">{formData.condition?.interior || 'N/A'}</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <span className="block text-xs text-gray-400">Photos Uploaded</span>
                                        <span className="font-bold text-gray-700">{Object.values(formData.photos || {}).filter(v => v && typeof v === 'string').length} Files</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    const handleTestFill = () => {
        setFormData({
            ...formData,
            licensePlate: "DL88CC1234",
            make: "Maruti",
            model: "Swift Dzire",
            variant: "VXI",
            color: "White",
            vin: "MA3EWE1234567890",
            engineNumber: "E1234567890",
            chassisNumber: "C1234567890",
            manufacturingYear: "2022",
            category: "4W",
            // Client ID needs to be valid, selecting first available if any
            clientId: clients.length > 0 ? clients[0]._id : "",
            contractNumber: "CN-987654321",
            borrowerName: "Rahul Sharma",
            customerContactNumber: "9876543210",

            repoAgent: "Amit Kumar",
            repoDate: new Date().toISOString().split('T')[0],
            repoType: "Surrender",
            bankName: "HDFC Bank",
            inHouseAgent: true,
            agentProof: "Aadhar Card",
            proofNumber: "1234-5678-9012",
            repAgencyDetails: "In-house recovery team",

            condition: {
                exterior: "Good",
                interior: "Good",
                startingCondition: "Starts",
                starts: true,
                odometer: "45000",
                battery: "Working",
                batteryMake: "Exide",
                batteryBrandModel: "PowerSafe",
            },

            tyreDetails: {
                noOfAxles: 2,
                noOfTyres: 4,
                tyreMake: "MRF",
                frontRight: "Good",
                frontLeft: "Good",
                rearRight: "Average",
                rearLeft: "Good"
            },

            accessories: {
                originalRC: true,
                insurancePolicyNumber: "POL-123456789"
            },

            // Dummy URLs for photos to pass validation (user can replace them)
            photos: {
                ...formData.photos,
                front: "https://placehold.co/600x400/png?text=Front+View",
                back: "https://placehold.co/600x400/png?text=Back+View",
                left: "https://placehold.co/600x400/png?text=Left+View",
                right: "https://placehold.co/600x400/png?text=Right+View",
                odometer: "https://placehold.co/600x400/png?text=Odometer",
                agentSignature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKwAEQAAAABJRU5ErkJggg==", // 1x1 pixel dot
                yardStaffSignature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKwAEQAAAABJRU5ErkJggg=="
            }
        });
        // Jump to last step to show it's done, or stay? Maybe stay.
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">{editMode ? "Edit Vehicle" : "New Entry"}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Step {step} of {steps.length}: {steps[step - 1].title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleTestFill}
                            className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-200 transition-colors"
                            title="Auto-fill form for testing"
                        >
                            🪄 Magic Fill
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="h-5 w-5 text-gray-500" /></button>
                    </div>
                </div>

                {/* Stepper Progress */}
                <div className="px-8 pt-6">
                    <div className="flex justify-between relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10" />
                        {steps.map((s) => (
                            <div key={s.id} className={cn("flex flex-col items-center gap-2 bg-white px-2 transition-all duration-300", step >= s.id ? "opacity-100" : "opacity-40")}>
                                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all",
                                    step > s.id ? "bg-teal-500 border-teal-500 text-white" :
                                        step === s.id ? "bg-white border-teal-500 text-teal-600 scale-110" : "bg-gray-50 border-gray-200 text-gray-400")}>
                                    <s.icon className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider">{s.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    <style>{`
                        .input-field {
                            width: 100%;
                            padding: 12px 16px;
                            border-radius: 12px;
                            background-color: #F9FAFB;
                            border: 1px solid #E5E7EB;
                            font-size: 0.875rem;
                            font-weight: 600;
                            color: #374151;
                            outline: none;
                            transition: all 0.2s;
                        }
                        .input-field:focus {
                            background-color: #FFFFFF;
                            border-color: #14B8A6;
                            box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);
                        }
                        .label-text {
                            font-size: 0.7rem;
                            font-weight: 800;
                            color: #9CA3AF;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                            margin-bottom: 4px;
                            display: block;
                            margin-left: 4px;
                        }
                    `}</style>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
                            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-red-800">Validation Error</h4>
                                <p className="text-xs text-red-600 font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    {renderStepContent()}
                </div>

                {/* Footer Controls */}
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <button onClick={handlePrev} disabled={step === 1} className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-200 disabled:opacity-30 transition-all text-sm">Back</button>

                    {step === steps.length ? (
                        <button
                            onClick={handleFinalSubmit}
                            disabled={loading || uploadingCount > 0}
                            className="px-8 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black shadow-lg shadow-gray-900/20 transition-all text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {uploadingCount > 0 ? `Uploading (${uploadingCount})...` : "Complete Entry"}
                        </button>
                    ) : (
                        <button onClick={handleNext} className="px-8 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-500/20 transition-all text-sm flex items-center gap-2">
                            Next Step <ChevronRight className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VehicleEntryModal;
