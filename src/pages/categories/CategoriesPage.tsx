import React, { useEffect, useState } from 'react';
import { Edit2, Plus, Tag as TagIcon, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Button, Card, Input, Modal, Select } from '../../components/ui';
import { Category } from '../../types';
import { createCategory, deleteCategory, fetchCategories, updateCategory } from '../../api/categories';

export function CategoriesPage() {
  const { t } = useLanguage();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeType, setActiveType] = useState<Category['type']>('expense');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      setCategories(await fetchCategories());
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const visibleCategories = categories.filter((c) => c.type === activeType);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name') as string,
      type: formData.get('type') as Category['type'],
      icon: (formData.get('icon') as string) || null,
    };

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
      } else {
        await createCategory(payload);
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      await loadCategories();
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      /* ignore: backend blocks deleting the default category */
    }
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-serif italic tracking-tight mb-2">{t.categories}</h2>
          <p className="text-neutral-500 font-medium">{t.categoriesSubtitle}</p>
        </div>

        <Button onClick={() => { setEditingCategory(null); setIsModalOpen(true); }} className="px-6 py-4 rounded-3xl">
          <Plus size={20} />
          {t.newCategory}
        </Button>
      </header>

      <div className="inline-flex items-center gap-1 rounded-full border border-brand-border bg-neutral-900 p-1">
        {(['expense', 'income'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              activeType === type
                ? type === 'expense'
                  ? 'bg-expense text-white'
                  : 'bg-income text-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {type === 'expense' ? t.categoryTypeExpense : t.categoryTypeIncome}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="px-8 py-20 text-center text-neutral-500 font-medium animate-pulse">{t.loadingEntries}</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <tbody>
                {visibleCategories.map((category) => (
                  <tr key={category.id} className="border-b border-brand-border last:border-0 hover:bg-white/[0.01] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-white">
                          <TagIcon size={18} />
                        </div>
                        <span className="font-medium text-lg">{category.name}</span>
                        {category.is_default && (
                          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-brand-border text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
                            {t.defaultBadge}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(category)}
                          className="p-2 hover:bg-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>
                        {!category.is_default && (
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="p-2 hover:bg-red-500/10 rounded-xl text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {visibleCategories.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-8 py-20 text-center text-neutral-500 font-medium italic">
                      {t.noCategories}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCategory(null); }}
        title={editingCategory ? t.editCategory : t.newCategoryTitle}
      >
        <form key={editingCategory?.id ?? 'new'} onSubmit={handleSave} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.categoryName}</label>
            <Input name="name" defaultValue={editingCategory?.name} placeholder={t.categoryNamePlaceholder} required autoFocus />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.categoryType}</label>
            <Select name="type" defaultValue={editingCategory?.type ?? activeType} required>
              <option value="expense">{t.categoryTypeExpense}</option>
              <option value="income">{t.categoryTypeIncome}</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.categoryIcon}</label>
            <Input name="icon" defaultValue={editingCategory?.icon ?? ''} placeholder={t.categoryIconPlaceholder} />
          </div>
          <div className="pt-4 flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => { setIsModalOpen(false); setEditingCategory(null); }}>
              {t.cancel}
            </Button>
            <Button type="submit" className="flex-1 py-4 text-base">
              {editingCategory ? t.saveChanges : t.newCategory}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
