import React, { useEffect, useState } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Button, Input, Modal } from '../../components/ui';
import { Tag } from '../../types';
import { createTag, deleteTag, fetchTags, updateTag } from '../../api/tags';

export function TagsPage() {
  const { t } = useLanguage();

  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const loadTags = async () => {
    setIsLoading(true);
    try {
      setTags(await fetchTags());
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = { name: formData.get('name') as string };

    try {
      if (editingTag) {
        await updateTag(editingTag.id, payload);
      } else {
        await createTag(payload);
      }
      setIsModalOpen(false);
      setEditingTag(null);
      await loadTags();
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTag(id);
      setTags((prev) => prev.filter((tag) => tag.id !== id));
    } catch {
      /* ignore */
    }
  };

  const openEdit = (tag: Tag) => {
    setEditingTag(tag);
    setIsModalOpen(true);
  };

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-serif italic tracking-tight mb-2">{t.tags}</h2>
          <p className="text-neutral-500 font-medium">{t.tagsSubtitle}</p>
        </div>

        <Button onClick={() => { setEditingTag(null); setIsModalOpen(true); }} className="px-6 py-4 rounded-3xl">
          <Plus size={20} />
          {t.newTag}
        </Button>
      </header>

      {isLoading ? (
        <div className="py-20 text-center">
          <p className="text-neutral-500 font-medium animate-pulse">{t.loadingEntries}</p>
        </div>
      ) : tags.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-neutral-800 rounded-[32px]">
          <p className="text-neutral-500 font-medium">{t.noTags}</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="group flex items-center gap-2 pl-4 pr-2 py-2 rounded-full bg-neutral-900/50 border border-brand-border hover:border-neutral-700 transition-all"
            >
              <span className="font-medium text-neutral-200">{tag.name}</span>
              <button
                onClick={() => openEdit(tag)}
                className="p-1.5 hover:bg-neutral-800 rounded-full text-neutral-500 hover:text-white transition-colors cursor-pointer"
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={() => handleDelete(tag.id)}
                className="p-1.5 hover:bg-red-500/10 rounded-full text-neutral-500 hover:text-red-500 transition-colors cursor-pointer"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTag(null); }}
        title={editingTag ? t.editTag : t.newTagTitle}
      >
        <form key={editingTag?.id ?? 'new'} onSubmit={handleSave} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-500 ml-1">{t.tagName}</label>
            <Input name="name" defaultValue={editingTag?.name} placeholder={t.tagNamePlaceholder} required autoFocus />
          </div>
          <div className="pt-4 flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => { setIsModalOpen(false); setEditingTag(null); }}>
              {t.cancel}
            </Button>
            <Button type="submit" className="flex-1 py-4 text-base">
              {editingTag ? t.saveChanges : t.newTag}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
