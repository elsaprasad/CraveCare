import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Trash2, CheckCheck, Plus, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getGroceryList, toggleGroceryItem, deleteGroceryItem,
  clearCheckedItems, addGroceryItems, type GroceryItem,
} from '@/lib/supabase-service';

interface GroceryListPageProps {
  userId: string;
}

const GroceryListPage = ({ userId }: GroceryListPageProps) => {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addInput, setAddInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const loadList = useCallback(async () => {
    try {
      const data = await getGroceryList(userId);
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadList(); }, [loadList]);

  // Group items by source recipe (ungrouped = manually added)
  const groups = items.reduce<Record<string, GroceryItem[]>>((acc, item) => {
    const key = item.sourceRecipeName ?? '__manual__';
    acc[key] = acc[key] ? [...acc[key], item] : [item];
    return acc;
  }, {});

  const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
    if (a === '__manual__') return 1;
    if (b === '__manual__') return -1;
    return a.localeCompare(b);
  });

  const uncheckedCount = items.filter(i => !i.checked).length;
  const checkedCount = items.filter(i => i.checked).length;

  const handleToggle = async (item: GroceryItem) => {
    // Optimistic update
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i));
    try {
      await toggleGroceryItem(item.id, !item.checked);
    } catch {
      // revert
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: item.checked } : i));
    }
  };

  const handleDelete = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    try {
      await deleteGroceryItem(id);
    } catch {
      loadList(); // revert from server
    }
  };

  const handleClearChecked = async () => {
    if (checkedCount === 0) return;
    setClearing(true);
    setItems(prev => prev.filter(i => !i.checked));
    try {
      await clearCheckedItems(userId);
    } catch {
      loadList();
    } finally {
      setClearing(false);
    }
  };

  const handleAddManual = async () => {
    const trimmed = addInput.trim();
    if (!trimmed) return;
    setAdding(true);
    const optimisticItem: GroceryItem = {
      id: `temp-${Date.now()}`,
      name: trimmed,
      checked: false,
      createdAt: Date.now(),
    };
    setItems(prev => [...prev, optimisticItem]);
    setAddInput('');
    try {
      const added = await addGroceryItems(userId, [{ name: trimmed }]);
      setItems(prev => prev.map(i => i.id === optimisticItem.id ? added[0] : i));
    } catch {
      setItems(prev => prev.filter(i => i.id !== optimisticItem.id));
    } finally {
      setAdding(false);
    }
  };

  const toggleGroup = (key: string) => {
    setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  return (
    <div className="pb-28 px-5">
      {/* Header */}
      <div className="pt-8 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ShoppingCart size={22} className="text-primary" /> Grocery List
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {uncheckedCount === 0 && items.length > 0
                ? '🎉 All done! Clear to start fresh.'
                : uncheckedCount > 0
                ? `${uncheckedCount} item${uncheckedCount !== 1 ? 's' : ''} left to grab`
                : 'Add ingredients from recipes or manually'}
            </p>
          </div>
          {checkedCount > 0 && (
            <button
              onClick={handleClearChecked}
              disabled={clearing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-muted-foreground text-xs font-semibold hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              {clearing ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={14} />}
              Clear done
            </button>
          )}
        </div>

        {/* Progress bar */}
        {items.length > 0 && (
          <div className="mt-4">
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full gradient-coral rounded-full transition-all duration-500"
                style={{ width: `${(checkedCount / items.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {checkedCount}/{items.length} grabbed
            </p>
          </div>
        )}
      </div>

      {/* Manual add */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={addInput}
          onChange={e => setAddInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddManual()}
          placeholder="Add ingredient manually..."
          className="flex-1 px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
        <button
          onClick={handleAddManual}
          disabled={adding || !addInput.trim()}
          className="px-4 py-3 rounded-xl gradient-coral text-primary-foreground disabled:opacity-50"
        >
          {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />}
        </button>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-lg font-semibold text-foreground mb-2">Your list is empty</p>
          <p className="text-sm text-muted-foreground">
            Tap <strong>"Add to Grocery List"</strong> on any recipe to get started!
          </p>
        </div>
      )}

      {/* Grouped items */}
      <div className="space-y-4">
        {sortedGroupKeys.map(groupKey => {
          const groupItems = groups[groupKey];
          const recipeName = groupKey === '__manual__' ? null : groupKey;
          const recipeEmoji = groupItems[0]?.sourceRecipeEmoji ?? '📝';
          const isCollapsed = collapsedGroups[groupKey] ?? false;
          const groupChecked = groupItems.filter(i => i.checked).length;

          return (
            <div key={groupKey} className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Group header */}
              <button
                onClick={() => toggleGroup(groupKey)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{recipeName ? recipeEmoji : '✏️'}</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">
                      {recipeName ?? 'Added manually'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {groupChecked}/{groupItems.length} done
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {groupChecked === groupItems.length && groupItems.length > 0 && (
                    <span className="text-xs text-sage font-semibold">✅ All done</span>
                  )}
                  {isCollapsed ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronUp size={16} className="text-muted-foreground" />}
                </div>
              </button>

              {/* Items */}
              {!isCollapsed && (
                <div className="border-t border-border divide-y divide-border/50">
                  {groupItems.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${item.checked ? 'bg-muted/20' : ''}`}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggle(item)}
                        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          item.checked
                            ? 'gradient-coral border-primary'
                            : 'border-border bg-background'
                        }`}
                      >
                        {item.checked && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>

                      {/* Name */}
                      <span className={`flex-1 text-sm transition-all ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {item.name}
                        {item.quantity && (
                          <span className="text-muted-foreground ml-1">· {item.quantity}</span>
                        )}
                      </span>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroceryListPage;