import { FiGrid, FiUsers, FiClipboard, FiTrendingUp, FiCheckCircle, FiActivity } from 'react-icons/fi';
import { GiWeightLiftingUp, GiFruitBowl, GiWeightScale } from 'react-icons/gi';

// Mapa centralizado de iconos del menú: cada entrada de menuConfig.json referencia
// una de estas claves (string) en vez de un emoji, y aquí resolvemos a un icono
// vectorial real (react-icons), consistente en tamaño, grosor de trazo y color
// con el resto de la interfaz.
const ICON_MAP = {
    dashboard: FiGrid,
    clients: FiUsers,
    exercises: GiWeightLiftingUp,
    nutrition: GiFruitBowl,
    plans: FiClipboard,
    reports: FiTrendingUp,
    progress: FiTrendingUp,
    checkin: FiCheckCircle,
    session: FiActivity,
    'weight-log': GiWeightScale,
};

export default ICON_MAP;
