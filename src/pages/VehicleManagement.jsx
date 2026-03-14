import {
    Plus
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { useAuth } from "../context/AuthContext";

// New Components
import VehicleStats from "../components/vehicles/VehicleStats";
import VehicleEntryModal from "../components/vehicles/VehicleEntryModal";
import VehicleTable from "../components/vehicles/VehicleTable";

const VehicleManagement = () => {
    const toast = useToast();
    const { user, selectedBranch } = useAuth(); // Get selectedBranch
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [totalVehicles, setTotalVehicles] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(8);

    // CRUD States
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [clients, setClients] = useState([]);
    const [yards, setYards] = useState([]); // For Super Admin dropdown

    // Default form data
    const [formData, setFormData] = useState({
        licensePlate: '',
        make: '',
        model: '',
        engineNumber: '',
        chassisNumber: '',
        color: '',
        clientId: '',
        repoAgent: '',
        status: 'PARKED',
        category: '', // Added category
        entryDate: new Date().toISOString().split('T')[0],
        branchId: ''
    });

    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        id: null,
        loading: false
    });

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            // Include branchId in query if selected and not ALL
            const branchQuery = selectedBranch && selectedBranch !== 'ALL' ? `&branchId=${selectedBranch}` : '';
            const { data } = await api.get(`/vehicles?pageNumber=${page}&keyword=${keyword}${branchQuery}`);

            // Map backend data to frontend structure
            const mappedVehicles = data.vehicles.map(v => ({
                id: v._id,
                make: v.make + ' ' + v.model,
                plate: v.licensePlate,
                client: v.client,
                repoAgent: v.repoAgent,
                bankName: v.bankName,
                date: new Date(v.entryDate).toLocaleDateString(),
                status: v.status.charAt(0) + v.status.slice(1).toLowerCase(),
                accessories: v.accessories || { tami: false, tirpal: false, rassi: false },
                branchId: v.branchId // Keep raw branchId for editing
            }));

            setVehicles(mappedVehicles);
            setPages(data.pages);
            setPage(data.page);
            setTotalVehicles(0);
        } catch (error) {
            console.error("Error fetching vehicles:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            // Clients also need to be filtered by selected branch preferably, but api might handle it or we pass it
            const branchQuery = selectedBranch && selectedBranch !== 'ALL' ? { branchId: selectedBranch } : {};
            const { data } = await api.get("/clients", { params: branchQuery });
            setClients(data);
        } catch (error) {
            console.error("Error fetching clients:", error);
        }
    };

    // Fetch Yards for Super Admin
    useEffect(() => {
        if (user?.role === 'SUPER_ADMIN') {
            const fetchYards = async () => {
                try {
                    const { data } = await api.get('/yards');
                    setYards(data);
                } catch (error) {
                    console.error("Failed to fetch yards", error);
                }
            };
            fetchYards();
        }
    }, [user]);

    // Re-fetch when branch changes
    useEffect(() => {
        // Reset page to 1 when branch changes to avoid empty pages
        setPage(1);
        fetchVehicles();
        fetchClients();
        // eslint-disable-next-line
    }, [page, keyword, selectedBranch]);

    // Auto-set branchId in form when modal opens
    useEffect(() => {
        if (!editMode && showModal && selectedBranch && selectedBranch !== 'ALL') {
            setFormData(prev => ({ ...prev, branchId: selectedBranch }));
        }
    }, [showModal, editMode, selectedBranch]);

    const resetForm = () => {
        setFormData({
            licensePlate: '',
            make: '',
            model: '',
            engineNumber: '',
            chassisNumber: '',
            color: '',
            clientId: '',
            repoAgent: '',
            status: 'PARKED',
            category: '', // Added category
            entryDate: new Date().toISOString().split('T')[0],
            branchId: (selectedBranch && selectedBranch !== 'ALL') ? selectedBranch : ''
        });
        setCurrentId(null);
        setEditMode(false);
    };

    const handleEdit = (vehicle) => {
        const foundClient = clients.find(c => c.matchName === vehicle.client);
        setFormData({
            licensePlate: vehicle.plate,
            make: vehicle.make.split(' ')[0],
            model: vehicle.make.split(' ').slice(1).join(' '),
            engineNumber: vehicle.engineNumber || '',
            chassisNumber: vehicle.chassisNumber || '',
            color: vehicle.color || '',
            clientId: foundClient?._id || '',
            repoAgent: vehicle.repoAgent,
            status: vehicle.status.toUpperCase(),
            category: vehicle.category || '', // Added category
            entryDate: new Date(vehicle.date).toISOString().split('T')[0],
            branchId: vehicle.branchId || '' // Set branchId for edit
        });
        setCurrentId(vehicle.id);
        setEditMode(true);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        setConfirmConfig({
            isOpen: true,
            id: id,
            loading: false
        });
    };

    const confirmDelete = async () => {
        try {
            setConfirmConfig(prev => ({ ...prev, loading: true }));
            await api.delete(`/vehicles/${confirmConfig.id}`);
            setConfirmConfig({ isOpen: false, id: null, loading: false });
            toast.success("Vehicle removed from inventory!");
            fetchVehicles();
        } catch (error) {
            console.error("Failed to delete vehicle", error);
            toast.error(error.response?.data?.message || "Failed to remove vehicle");
            setConfirmConfig(prev => ({ ...prev, loading: false }));
        }
    };

    const handleSubmit = async () => {
        try {
            // Validate Branch for Super Admin
            if (user?.role === 'SUPER_ADMIN' && !formData.branchId) {
                toast.error("Please assign a branch to this vehicle.");
                return;
            }

            const selectedClient = clients.find(c => c._id === formData.clientId);
            const payload = {
                ...formData,
                client: selectedClient?.matchName || '',
                // If branchId is not set (Manager), fall back to user's branch. Even needed? Backend might handle.
                // But better to send it if we have it.
                yardId: formData.branchId || user?.branchId,
            };

            if (editMode) {
                await api.put(`/vehicles/${currentId}`, payload);
                toast.success("Vehicle details updated!");
            } else {
                await api.post("/vehicles/entry", payload);
                toast.success("New vehicle added to inventory!");
            }
            setShowModal(false);
            resetForm();
            fetchVehicles();
        } catch (error) {
            console.error("Failed to save vehicle", error);
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Vehicle Inventory</h2>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Manage and Track Stock Units</p>
                </div>
                {/* <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="px-6 py-3.5 bg-gray-900 hover:bg-black text-white rounded-[1.4rem] font-bold shadow-xl shadow-gray-200 transition-all flex items-center gap-3 text-sm active:scale-95 group"
                >
                    <div className="h-6 w-6 rounded-lg bg-white/10 flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
                        <Plus className="h-4 w-4" />
                    </div>
                    Add New Vehicle
                </button> */}
            </div>

            {/* Component: Stats */}
            <VehicleStats totalVehicles={totalVehicles || vehicles.length} />

            {/* Component: Table */}
            <VehicleTable
                vehicles={vehicles}
                loading={loading}
                page={page}
                setPage={setPage}
                pages={pages}
                keyword={keyword}
                setKeyword={setKeyword}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
                totalVehicles={totalVehicles}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Component: Modal */}
            <VehicleEntryModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmit}
                formData={formData}
                setFormData={setFormData}
                editMode={editMode}
                clients={clients}
                loading={loading}
                user={user} // Pass user
                yards={yards} // Pass yards
            />

            <ConfirmDialog
                isOpen={confirmConfig.isOpen}
                onConfirm={confirmDelete}
                onClose={() => setConfirmConfig({ isOpen: false, id: null, loading: false })}
                loading={confirmConfig.loading}
                title="Delete Unit"
                message="Are you sure you want to remove this vehicle from inventory? This action cannot be undone."
                type="danger"
            />
        </div>
    );
};

export default VehicleManagement;
