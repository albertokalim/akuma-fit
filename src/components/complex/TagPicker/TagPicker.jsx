import { useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import { tagService } from '../../../services/tagService.js';
import { useAsyncData } from '../../../hooks/useAsyncData.js';

/**
 * Selector/creador de tags reutilizable (mismo patrón que ExerciseForm).
 * Si se pasa `category`, sólo sugiere tags de esa categoría y crea los
 * nuevos con ella (p.ej. 'dieta' para alimentos y recetas).
 */
function TagPicker({ selectedTags, onChange, category = null, placeholder }) {
    const [tagInput, setTagInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [createdTags, setCreatedTags] = useState([]);

    const { data: loadedTags } = useAsyncData(() => tagService.getAll(), [], []);

    const allTags = [...(loadedTags || []), ...createdTags];

    const visibleTags = category
        ? allTags.filter(tag => tag.category === category)
        : allTags;

    const suggestedTags = visibleTags.filter(
        tag => tag.name.toLowerCase().includes(tagInput.toLowerCase())
            && !selectedTags.some(selected => selected.id === tag.id)
    );

    const addTag = (tag) => {
        if (!selectedTags.some(selected => selected.id === tag.id)) {
            onChange([...selectedTags, tag]);
        }
        setTagInput('');
        setShowSuggestions(false);
    };

    const removeTag = (tagId) => {
        onChange(selectedTags.filter(tag => tag.id !== tagId));
    };

    const createNewTag = async () => {
        if (!tagInput.trim()) return;

        try {
            const newTag = await tagService.create(tagInput.trim(), category);
            setCreatedTags(prev => [...prev, newTag]);
            addTag(newTag);
        } catch {
            // tagService.create ya resuelve el duplicado devolviendo el existente
        }
    };

    const handleTagKeyDown = async (event) => {
        if (event.key !== 'Enter') return;

        event.preventDefault();
        const existing = visibleTags.find(
            tag => tag.name.toLowerCase() === tagInput.trim().toLowerCase()
        );

        if (existing) {
            addTag(existing);
        } else {
            await createNewTag();
        }
    };

    return (
        <div className="tag-input-container">
            <div className="tag-input-wrapper">
                <input
                    type="text"
                    value={tagInput}
                    onChange={(event) => {
                        setTagInput(event.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={placeholder || 'Escribe para buscar o crear un tag...'}
                    className="tag-input"
                />
                {tagInput && (
                    <button type="button" onClick={createNewTag} className="btn-icon" title="Crear nuevo tag">
                        <FiPlus />
                    </button>
                )}
            </div>

            {showSuggestions && suggestedTags.length > 0 && (
                <div className="tag-suggestions">
                    {suggestedTags.slice(0, 5).map(tag => (
                        <button
                            type="button"
                            key={tag.id}
                            onClick={() => addTag(tag)}
                            className="tag-suggestion-item"
                        >
                            {tag.name}
                        </button>
                    ))}
                </div>
            )}

            {selectedTags.length > 0 && (
                <div className="selected-tags">
                    {selectedTags.map(tag => (
                        <span key={tag.id} className="selected-tag">
                            {tag.name}
                            <button type="button" onClick={() => removeTag(tag.id)} className="remove-tag">
                                <FiX size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TagPicker;
