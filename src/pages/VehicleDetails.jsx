import { ArrowLeft, Car, Calendar, MapPin, User, FileText, CheckCircle2, AlertCircle, XCircle, Download, Share2, Briefcase, Clock, Shield, Eye, Smartphone, Zap, PenSquare, Trash2 } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api, { getFileUrl } from "../services/api";
import { cn } from "@/lib/utils";
import { generateVehiclePDF, previewVehiclePDF } from "../utils/pdfGenerator";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "../components/common/ConfirmDialog";
import VehicleEntryModal from "../components/vehicles/VehicleEntryModal";

const DetailsHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100 shadow-sm">
            <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
    </div>
);

const DetailItem = ({ label, value, subValue, highlight }) => (
    <div className="group">
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 group-hover:text-teal-600 transition-colors">{label}</p>
        <p className={cn("text-base font-bold text-slate-800", highlight && "text-teal-600")}>{value || "-"}</p>
        {subValue && <p className="text-xs text-slate-500 font-medium mt-0.5">{subValue}</p>}
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        PARKED: "bg-emerald-100 text-emerald-700 border-emerald-200",
        RELEASED: "bg-slate-100 text-slate-600 border-slate-200",
        SOLD: "bg-blue-100 text-blue-700 border-blue-200",
        DEFAULT: "bg-amber-100 text-amber-700 border-amber-200"
    };
    return (
        <span className={cn("px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 shadow-sm uppercase tracking-wide", styles[status] || styles.DEFAULT)}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {status}
        </span>
    );
};

const VehicleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pdfLang, setPdfLang] = useState('en');

    // Edit/Delete States
    const [showModal, setShowModal] = useState(false);
    const [clients, setClients] = useState([]);
    const [yards, setYards] = useState([]);
    const [formData, setFormData] = useState({});
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, id: null, loading: false });

    const fetchVehicleDetails = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/vehicles/${id}`);
            setVehicle(data);
        } catch (error) {
            console.error("Failed to fetch vehicle details", error);
            toast.error("Failed to load vehicle details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchVehicleDetails();
        }
        // Fetch clients for edit modal
        const fetchClients = async () => {
            try {
                const { data } = await api.get("/clients");
                setClients(data);
            } catch (error) {
                console.error("Error fetching clients:", error);
            }
        };
        fetchClients();

        // Fetch yards if super admin
        if (user?.role === 'SUPER_ADMIN') {
            api.get('/yards').then(({ data }) => setYards(data)).catch(console.error);
        }
    }, [id, user]);

    const handleDownloadPDF = async () => {
        try {
            await generateVehiclePDF(vehicle, pdfLang);
            toast.success(`Inventory sheet (${pdfLang === 'hi' ? 'Hindi' : 'English'}) downloaded!`);
        } catch (error) {
            console.error("PDF Fail", error);
            toast.error('Failed to generate PDF');
        }
    };

    const handlePreviewPDF = async () => {
        try {
            await previewVehiclePDF(vehicle, pdfLang);
            toast.success('Opening PDF preview...');
        } catch (error) {
            console.error("PDF Preview Fail", error);
            toast.error('Failed to preview PDF');
        }
    };

    const handleEdit = () => {
        if (!vehicle) return;

        // Robust Client Matching
        const foundClient = clients.find(c =>
            c.matchName === vehicle.client ||
            c.matchName.toLowerCase() === vehicle.client?.toLowerCase()
        );

        setFormData({
            licensePlate: vehicle.licensePlate,
            make: vehicle.make,
            model: vehicle.model,
            variant: vehicle.variant || '',
            manufacturingYear: vehicle.manufacturingYear || '',
            category: vehicle.category || '',
            vin: vehicle.vin || '',
            engineNumber: vehicle.engineNumber || '',
            chassisNumber: vehicle.chassisNumber || '',
            color: vehicle.color || '',

            clientId: foundClient?._id || '',
            contractNumber: vehicle.contractNumber || '',
            borrowerName: vehicle.borrowerName || '',
            borrowerAddress: vehicle.borrowerAddress || '',
            customerContactNumber: vehicle.customerContactNumber || '',
            paymentStatus: vehicle.paymentStatus || '',

            repoAgent: vehicle.repoAgent || '',
            repoDate: vehicle.repoDate ? new Date(vehicle.repoDate).toISOString().split('T')[0] : '',
            repoType: vehicle.repoType || '',
            bankName: vehicle.bankName || '',
            repAgencyDetails: vehicle.repAgencyDetails || '',
            inHouseAgent: vehicle.inHouseAgent || false,
            agentProof: vehicle.agentProof || '',
            proofNumber: vehicle.proofNumber || '',
            inventoryOwner: vehicle.inventoryOwner || '',

            status: vehicle.status,
            entryDate: vehicle.entryDate ? new Date(vehicle.entryDate).toISOString().split('T')[0] : '',
            branchId: vehicle.yardId?._id || vehicle.yardId || '',

            // Nested objects (Spread / Deep Copy)
            condition: { ...(vehicle.condition || {}) },
            accessories: { ...(vehicle.accessories || {}) },
            tyreDetails: { ...(vehicle.tyreDetails || {}) },
            keyInventory: { ...(vehicle.keyInventory || {}) },

            // Fix Photo Mapping (Backend 'rc' -> Frontend 'rcBlob')
            photos: {
                ...(vehicle.photos || {}),
                rcBlob: vehicle.photos?.rc,
                insuranceBlob: vehicle.photos?.insurance
            },

            damages: [...(vehicle.damages || [])],
            damageReport: vehicle.damageReport || ''
        });
        setShowModal(true);
    };

    const handleDelete = () => {
        setConfirmConfig({ isOpen: true, id: vehicle._id, loading: false });
    };

    const confirmDelete = async () => {
        try {
            setConfirmConfig(prev => ({ ...prev, loading: true }));
            await api.delete(`/vehicles/${vehicle._id}`);
            toast.success("Vehicle deleted successfully");
            navigate('/vehicles');
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete vehicle");
            setConfirmConfig(prev => ({ ...prev, loading: false }));
        }
    };

    const handleSubmitEdit = async () => {
        try {
            const selectedClient = clients.find(c => c._id === formData.clientId);
            const payload = {
                ...formData,
                client: selectedClient?.matchName || '',
                yardId: formData.branchId || user?.branchId
            };
            await api.put(`/vehicles/${vehicle._id}`, payload);
            toast.success("Vehicle updated successfully");
            setShowModal(false);
            fetchVehicleDetails(); // Refresh data
        } catch (error) {
            console.error("Update failed", error);
            toast.error("Failed to update vehicle");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-teal-600 animate-spin shadow-lg shadow-teal-500/30" />
                <p className="text-slate-400 font-bold animate-pulse text-sm tracking-wider uppercase">Loading Dossier...</p>
            </div>
        </div>
    );

    if (!vehicle) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
            <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Car className="h-10 w-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Vehicle Not Found</h2>
            <Link to="/vehicles" className="px-6 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors">
                Back to Fleet
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            {/* 1. Header Section (Simplified) */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/vehicles')} className="group flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
                            <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-slate-300">
                                <ArrowLeft className="h-4 w-4" />
                            </div>
                            <span className="font-bold text-sm">Back</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
                        <button onClick={handleEdit} className="h-9 w-9 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-teal-600 hover:border-teal-200 flex items-center justify-center shadow-sm transition-all" title="Edit Vehicle">
                            <PenSquare className="h-4 w-4" />
                        </button>
                        <button onClick={handleDelete} className="h-9 w-9 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 flex items-center justify-center shadow-sm transition-all" title="Delete Vehicle">
                            <Trash2 className="h-4 w-4" />
                        </button>

                        <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>

                        <div className="flex items-center bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                            <button
                                onClick={() => setPdfLang('en')}
                                className={cn("px-3 py-1 rounded-md text-xs font-bold transition-all", pdfLang === 'en' ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:text-slate-700")}
                            >
                                English
                            </button>
                            <button
                                onClick={() => setPdfLang('hi')}
                                className={cn("px-3 py-1 rounded-md text-xs font-bold transition-all", pdfLang === 'hi' ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:text-slate-700")}
                            >
                                Hindi
                            </button>
                        </div>

                        <button onClick={handlePreviewPDF} className="h-9 px-4 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center gap-2 shadow-sm">
                            <Eye className="h-3 w-3" /> Preview
                        </button>

                        <button onClick={handleDownloadPDF} className="h-9 px-4 rounded-lg bg-teal-600 text-white font-bold text-xs shadow-md shadow-teal-500/20 hover:bg-teal-700 flex items-center gap-2">
                            <Download className="h-3 w-3" /> Download PDF
                        </button>
                    </div>
                </div>

                <div className="mt-4">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        {vehicle.make} {vehicle.model}
                        <span className="text-teal-600 font-medium bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100 text-lg">
                            {vehicle.licensePlate}
                        </span>
                    </h1>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mt-2">
                        <Briefcase className="h-3 w-3" /> {vehicle.client} • {vehicle.category || '4 wheeler'}
                    </p>
                </div>
            </div>

            <VehicleEntryModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmitEdit}
                formData={formData}
                setFormData={setFormData}
                editMode={true}
                clients={clients}
                loading={loading}
                user={user}
                yards={yards}
            />

            <ConfirmDialog
                isOpen={confirmConfig.isOpen}
                onConfirm={confirmDelete}
                onClose={() => setConfirmConfig({ isOpen: false, id: null, loading: false })}
                loading={confirmConfig.loading}
                title="Delete Vehicle"
                message="Are you sure you want to delete this vehicle? This action cannot be undone."
                type="danger"
            />

            {/* 2. Main Content Grid */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN (Photos & Status) */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Hero Image Card */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                <Eye className="h-5 w-5 text-teal-600" /> Vehicle Photos
                            </h3>
                            <StatusBadge status={vehicle.status || 'PARKED'} />
                        </div>

                        {/* Main Image */}
                        <div className="aspect-[4/3] rounded-xl bg-slate-100 overflow-hidden relative mb-4 border-2 border-slate-100">
                            {vehicle.photos?.front ? (
                                <img
                                    src={getFileUrl(vehicle.photos.front)}
                                    alt="Front View"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 border-2 border-red-100 border-dashed text-red-400">
                                    <AlertCircle className="h-10 w-10 mb-2" />
                                    <span className="font-bold">FRONT PHOTO MISSING</span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Grid - Explicit Labels */}
                        <div className="grid grid-cols-4 gap-2">
                            {['back', 'left', 'right', 'interior', 'dashboard', 'engine', 'chassis', 'odometer'].map((view) => (
                                <div key={view} className="relative aspect-square rounded-lg overflow-hidden border bg-slate-50">
                                    {vehicle.photos?.[view] ? (
                                        <img src={getFileUrl(vehicle.photos[view])} alt={view} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 border-red-100 text-red-500">
                                            <XCircle className="h-4 w-4 mb-0.5" />
                                            <span className="text-[8px] font-bold uppercase">Msng</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[8px] font-bold text-center py-0.5 uppercase">
                                        {view}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tyre Health */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
                            <Briefcase className="h-5 w-5 text-teal-600" /> Tyre Condition
                        </h3>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <div className="flex justify-between mb-4 text-sm">
                                <span>Mask: <strong>{vehicle.tyreDetails?.tyreMake || 'N/A'}</strong></span>
                                <span>Qty: <strong>{vehicle.tyreDetails?.noOfTyres || '-'}</strong></span>
                            </div>
                            <div className="relative">
                                {/* Simple Car Outline CSS */}
                                <div className="h-32 w-16 mx-auto border-2 border-slate-300 rounded-lg opacity-20 absolute left-0 right-0 top-0 bottom-0 m-auto"></div>

                                <div className="grid grid-cols-2 gap-x-16 gap-y-8 relative z-10">
                                    <TyreWidget pos="Front Left" val={vehicle.tyreDetails?.frontLeft} />
                                    <TyreWidget pos="Front Right" val={vehicle.tyreDetails?.frontRight} />
                                    <TyreWidget pos="Rear Left" val={vehicle.tyreDetails?.rearLeft} />
                                    <TyreWidget pos="Rear Right" val={vehicle.tyreDetails?.rearRight} />
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-200 text-center text-sm">
                                Stepney: <Badge variant={vehicle.tyreDetails?.stepneyCondition === 'Good' ? 'success' : 'danger'}>{vehicle.tyreDetails?.stepneyCondition || 'Missing'}</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN (Data Checklist) */}
                <div className="lg:col-span-7 space-y-6">

                    {/* Vehicle Identity & Contract - Compact Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Car className="h-4 w-4 text-teal-600" /> Vehicle Info
                            </h3>
                            <span className="text-xs font-mono text-slate-500">{vehicle.chassisNumber}</span>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                            <Row label="Make / Model" value={`${vehicle.make} ${vehicle.model}`} bold />
                            <Row label="Variant" value={vehicle.variant} />
                            <Row label="Color" value={vehicle.color} />
                            <Row label="Mfg Year" value={vehicle.manufacturingYear} />
                            <Row label="Engine No." value={vehicle.engineNumber} />
                            <Row label="Chassis No." value={vehicle.chassisNumber} />
                            <Row label="Odometer" value={`${vehicle.condition?.odometer || 0} km`} bold highlight />
                            <Row label="Fuel" value={vehicle.fuelType} />
                        </div>

                        <div className="bg-slate-50 px-4 py-3 border-y border-slate-200 mt-2">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <User className="h-4 w-4 text-teal-600" /> Customer & Loan
                            </h3>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                            <Row label="Customer Name" value={vehicle.borrowerName} bold />
                            <Row label="Contact" value={vehicle.customerContactNumber} />
                            <Row label="Bank / Client" value={vehicle.client} bold highlight />
                            <Row label="Agreement No" value={vehicle.contractNumber} />
                        </div>
                    </div>

                    {/* Accessories & Condition Checklist */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-teal-600" /> Inspection Checklist
                            </h3>
                            <div className="text-xs font-medium text-slate-500">
                                Green = Present, Red = Missing
                            </div>
                        </div>
                        <div className="p-4">
                            {/* Accessories Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                                {Object.entries(vehicle.accessories || {}).map(([key, val]) => {
                                    if (typeof val !== 'boolean') return null;
                                    return (
                                        <div key={key} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold",
                                            val ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
                                        )}>
                                            {val ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Condition Summary */}
                            <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                                <ConditionBox label="Exterior" val={vehicle.condition?.exterior} />
                                <ConditionBox label="Interior" val={vehicle.condition?.interior} />
                                <ConditionBox label="Working" val={vehicle.condition?.starts ? "Starts" : "Non-Starter"} isBad={!vehicle.condition?.starts} />
                            </div>
                            {vehicle.damageReport && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                                    <span className="font-bold uppercase text-xs block mb-1">Damage Report:</span>
                                    {vehicle.damageReport}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Documents & Repo Details */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                        <div className="px-4 py-3 border-b border-slate-200">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-teal-600" /> Documents & Repo Proof
                            </h3>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <p className="text-xs font-bold uppercase text-slate-400">Required Docs</p>
                                {[
                                    { k: 'RC', v: vehicle.photos?.rcBlob },
                                    { k: 'Insurance', v: vehicle.photos?.insuranceBlob },
                                    { k: 'Surrender Letter', v: vehicle.photos?.surrenderLetter },
                                    { k: 'Police Int.', v: vehicle.photos?.prePoliceIntimation },
                                    { k: 'Inventory Sheet', v: null, isStatic: true }  // Just placeholder
                                ].map((doc, i) => (
                                    <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                                        <span className="text-sm font-medium text-slate-700">{doc.k}</span>
                                        {doc.isStatic ? (
                                            <span className="text-xs text-slate-400 italic">Generated</span>
                                        ) : doc.v ? (
                                            <a href={getFileUrl(doc.v)} target="_blank" className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1">
                                                View <Eye className="h-3 w-3" />
                                            </a>
                                        ) : (
                                            <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                                                Missing <AlertCircle className="h-3 w-3" />
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-bold uppercase text-slate-400">Repo Details</p>
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Agent:</span>
                                        <span className="font-bold">{vehicle.repoAgent}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Date:</span>
                                        <span className="font-bold">{new Date(vehicle.repoDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Type:</span>
                                        <Badge status={vehicle.repoType || 'Standard'}>{vehicle.repoType || 'Standard'}</Badge>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200">
                                        <span className="text-slate-500 block text-xs mb-1">Signatures:</span>
                                        <div className="flex gap-2">
                                            <SigStatus label="Agent" present={vehicle.photos?.agentSignature} />
                                            <SigStatus label="Yard" present={vehicle.photos?.yardStaffSignature} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// --- Sub Components ---

const Row = ({ label, value, bold, highlight }) => (
    <div className="flex justify-between items-center py-1">
        <span className="text-slate-500">{label}</span>
        <span className={cn("text-right", bold && "font-bold text-slate-800", highlight && "text-teal-600")}>{value || '-'}</span>
    </div>
);

const ConditionBox = ({ label, val, isBad }) => (
    <div className={cn("text-center p-2 rounded-lg border",
        !val ? "bg-slate-50 border-slate-100" :
            isBad ? "bg-red-50 border-red-200 text-red-800" : "bg-teal-50 border-teal-200 text-teal-800"
    )}>
        <p className="text-[10px] uppercase text-slate-400 mb-1">{label}</p>
        <p className="font-bold text-sm">{val || '-'}</p>
    </div>
);

const TyreWidget = ({ pos, val }) => (
    <div className={cn("text-center p-2 rounded-lg border shadow-sm",
        val === 'Good' ? "bg-emerald-50 border-emerald-200" :
            val === 'Average' ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"
    )}>
        <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">{pos}</p>
        <p className={cn("text-xs font-bold",
            val === 'Good' ? "text-emerald-700" :
                val === 'Average' ? "text-amber-700" : "text-red-700"
        )}>{val || 'Mis'}</p>
    </div>
);

const SigStatus = ({ label, present }) => (
    <div className={cn("flex-1 px-2 py-1 rounded text-center text-xs font-bold border",
        present ? "bg-teal-50 border-teal-200 text-teal-700" : "bg-red-50 border-red-100 text-red-400"
    )}>
        {label}: {present ? "Signed" : "Pending"}
    </div>
);

const Badge = ({ children, variant = "default", className }) => {
    const variants = {
        default: "bg-slate-100 text-slate-600",
        success: "bg-emerald-100 text-emerald-700",
        danger: "bg-red-100 text-red-700",
        warning: "bg-amber-100 text-amber-700"
    };
    return (
        <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider", variants[variant] || variants.default, className)}>
            {children}
        </span>
    );
};


export default VehicleDetails;
