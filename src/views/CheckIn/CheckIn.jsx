import { useState, useEffect } from 'react';
import DataTable from '../../components/complex/DataTable/DataTable.jsx';
import Button from '../../components/primitives/Button/Button.jsx';
import { supabase } from '../../supabaseClient.js';
import CheckInForm from '../CheckInForm/CheckInForm.jsx';
import './CheckIn.css';

function CheckIn() {
    const [showForm, setShowForm] = useState(false);
    const [checkIns, setCheckIns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadCheckIns = async () => {
        try {
            const { data: authData, error: authError } = await supabase.auth.getUser();

            if (authError || !authData?.user) {
                throw new Error('Debes iniciar sesión para ver tus check-ins.');
            }

            const { data: profile, error: profileError } = await supabase
                .from('profile')
                .select('id')
                .eq('user', authData.user.id)
                .maybeSingle();

            if (profileError) {
                throw new Error(`No se pudo comprobar el perfil: ${profileError.message}`);
            }

            if (!profile) {
                setCheckIns([]);
                setLoading(false);
                return;
            }

            const { data: checkInsData, error: fetchError } = await supabase
                .from('check_in')
                .select('*')
                .eq('profile_id', profile.id)
                .order('created_at', { ascending: false });

            if (fetchError) {
                throw new Error(`No se pudieron cargar los check-ins: ${fetchError.message}`);
            }

            setCheckIns(checkInsData || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCheckIns();
    }, []);

    const handleFormComplete = () => {
        setShowForm(false);
        loadCheckIns();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const checkInColumns = [
        { key: 'created_at', label: 'Fecha', render: (val) => formatDate(val) },
        { key: 'how_do_you_feel', label: '¿Cómo te has sentido?' },
        { key: 'diet_adherence', label: 'Dieta' },
        { key: 'training_adherence', label: 'Entrenamiento' },
        { key: 'hunger_level', label: 'Hambre' },
        { key: 'rest_quality', label: 'Descanso' },
        { key: 'comments', label: 'Comentarios' },
    ];

    if (showForm) {
        return <CheckInForm onComplete={handleFormComplete} onCancel={() => setShowForm(false)} />;
    }

    return (
        <div className="check-in">
            <h1 className="check-in-title">Mis Check-Ins</h1>
            <p className="check-in-description">Revisa tu historial de check-ins semanales para ver tu progreso.</p>

            {loading && <div className="check-in-loading">Cargando check-ins...</div>}
            {error && <div className="error-message">{error}</div>}

            {!loading && !error && checkIns.length === 0 && (
                <div className="check-in-empty">
                    <p>Aún no has realizado ningún check-in.</p>
                    <p>¡Haz tu primer check-in para empezar a trackear tu progreso!</p>
                </div>
            )}

            {!loading && !error && checkIns.length > 0 && (
                <DataTable
                    columns={checkInColumns}
                    data={checkIns}
                />
            )}

            <Button
                text="+ Check In"
                onClick={() => setShowForm(true)}
                className="check-in-fab"
            />
        </div>
    );
}

export default CheckIn;