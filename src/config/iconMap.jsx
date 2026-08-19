import { FiGrid, FiUsers, FiClipboard, FiTrendingUp, FiCheckCircle, FiActivity } from 'react-icons/fi';
import { GiWeightLiftingUp, GiFruitBowl, GiWeightScale, GiCookingPot, GiMeal } from 'react-icons/gi';

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
    recipes: GiCookingPot,
    diet: GiMeal,
    'weight-log': GiWeightScale,
};

export default ICON_MAP;
