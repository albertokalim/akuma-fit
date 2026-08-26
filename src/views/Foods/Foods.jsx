import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiX, FiTag, FiUpload, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Button from '../../components/primitives/Button/Button.jsx';
import DataTable from '../../components/complex/DataTable/DataTable.jsx';
import { foodService } from '../../services/foodService.js';
import { tagService } from '../../services/tagService.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import FoodBulkImport from './FoodBulkImport.jsx';

const DIET_TAG_CATEGORY = 'dieta';

/**
 * Biblioteca de alimentos del coach, con búsqueda, filtros por tags,
 * edición, borrado e importación masiva.
 */
function Foods() {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const debouncedSearchText = useDebouncedValue(searchText);
    const [selectedTagIds, setSelectedTagIds] = useState([]);
    const [showImport, setShowImport] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    const loadFoods = async () => foodService.getAll({
        text: debouncedSearchText || undefined,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
    });

    const { data: foods, loading, error } = useAsyncData(
        loadFoods,
        [debouncedSearchText, selectedTagIds, reloadKey]
    );

    const { data: allTags } = useAsyncData(() => tagService.getAll(), [reloadKey], []);
    const dietTags = (allTags || []).filter(tag => tag.category === DIET_TAG_CATEGORY);

    const reload = () => setReloadKey(key => key + 1);

    const toggleTag = (tagId) => {
        setSelectedTagIds(prev => (
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        ));
    };

    const clearFilters = () => {
        setSearchText('');
        setSelectedTagIds([]);
    };

    const handleEdit = (food) => {
        navigate(`/app/alimentos/${food.id}/edit`);
    };

    const handleDelete = async (food) => {
        if (!window.confirm(`¿Eliminar "${food.name}" de la biblioteca?`)) return;

        try {
            await foodService.delete(food.id);
            reload();
        } catch (err) {
            window.alert(`No se pudo eliminar: ${err.message}`);
        }
    };

    const handleImportSaved = () => {
        setShowImport(false);
        reload();
    };

    const hasActiveFilters = searchText || selectedTagIds.length > 0;

    const columns = [
        {
            key: 'name',
            label: 'Alimento',
            render: (_, food) => (
                <div className="diet-food-name-cell">
                    <span className="diet-food-name">{food.name}</span>
                    {food.brand && <span className="diet-food-brand">{food.brand}</span>}
                </div>
            ),
        },
        { key: 'calories', label: 'Kcal/100g', render: (value) => value ?? '—' },
        { key: 'protein', label: 'Prot/100g', render: (value) => value ?? '—' },
        { key: 'carbs', label: 'Carbs/100g', render: (value) => value ?? '—' },
        { key: 'fat', label: 'Grasa/100g', render: (value) => value ?? '—' },
        {
            key: 'tags',
            label: 'Tags',
            render: (_, food) => (
                <div className="diet-food-tags">
                    {(food.tags || []).map(tag => (
                        <span key={tag.id} className="tag-badge">{tag.name}</span>
                    ))}
                </div>
            ),
        },
        {
            key: 'actions',
            label: '',
            render: (_, food) => (
                <div className="diet-food-actions">
                    <button className="btn-icon" onClick={() => handleEdit(food)} title="Editar">
                        <FiEdit2 size={16} />
                    </button>
                    <button
                        className="btn-icon btn-icon-danger"
                        onClick={() => handleDelete(food)}
                        title="Eliminar"
                    >
                        <FiTrash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="diet-page">
            <div className="page-container">
                <div className="page-header">
                    <h1 className="page-title">Alimentos</h1>
                    <div className="diet-header-actions">
                        <Button variant="outline" onClick={() => setShowImport(true)}>
                            <FiUpload size={16} />
                            <span>Importar</span>
                        </Button>
                        <Button onClick={() => navigate('/app/alimentos/new')}>
                            <FiPlus size={18} />
                            <span>Nuevo alimento</span>
                        </Button>
                    </div>
                </div>

                <div className="filters-row">
                    <div className="search-box">
                        <FiSearch className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o marca..."
                            value={searchText}
                            onChange={(event) => setSearchText(event.target.value)}
                            className="search-input"
                        />
                        {searchText && (
                            <button onClick={() => setSearchText('')} className="clear-search">
                                <FiX size={16} />
                            </button>
                        )}
                    </div>

                    {hasActiveFilters && (
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                            Limpiar filtros
                        </Button>
                    )}
                </div>

                {dietTags.length > 0 && (
                    <div className="tags-filter">
                        <span className="tags-filter-label">
                            <FiTag size={14} />
                            Tags:
                        </span>
                        <div className="tags-list">
                            {dietTags.map(tag => (
                                <button
                                    key={tag.id}
                                    onClick={() => toggleTag(tag.id)}
                                    className={`tag-chip ${selectedTagIds.includes(tag.id) ? 'active' : ''}`}
                                >
                                    {tag.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="loading-state">Cargando alimentos...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={foods}
                        emptyMessage={hasActiveFilters
                            ? 'No se encontraron alimentos con esos filtros.'
                            : 'Aún no hay alimentos en la biblioteca. Crea uno o importa varios.'}
                    />
                )}
            </div>

            {showImport && (
                <FoodBulkImport
                    onClose={() => setShowImport(false)}
                    onSaved={handleImportSaved}
                />
            )}
        </div>
    );
}

export default Foods;
