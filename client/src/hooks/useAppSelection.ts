import { useSelection } from '../context/SelectionContext';

// Re-export the hook for convenience
// This provides a consistent interface for selection operations
export function useAppSelection() {
  const selection = useSelection();

  return {
    // State
    selectedIds: selection.selectedIds,
    selectedApps: selection.selectedApps,
    count: selection.selectionCount,

    // Checks
    isSelected: selection.isSelected,
    hasSelections: selection.selectionCount > 0,

    // Actions
    toggle: selection.toggleSelection,
    add: selection.addToSelection,
    remove: selection.removeFromSelection,
    clear: selection.clearSelection,
  };
}
