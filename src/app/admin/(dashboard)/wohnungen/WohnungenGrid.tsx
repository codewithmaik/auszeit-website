"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { ImageOff, ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ApartmentWithImages } from "@/db/queries";
import { moveApartment, reorderApartments } from "./actions";

function SortableCard({
  unit,
  index,
  total,
  photoFilter,
}: {
  unit: ApartmentWithImages;
  index: number;
  total: number;
  photoFilter?: string | null;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: unit.id,
  });
  const cover = unit.images[0];
  const moveUp = moveApartment.bind(null, unit.id, "up");
  const moveDown = moveApartment.bind(null, unit.id, "down");

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group bg-white border border-line rounded-[2px] overflow-hidden hover:border-gold transition-colors ${
        isDragging ? "opacity-50 z-10" : ""
      }`}
    >
      <Link href={`/admin/wohnungen/${unit.id}`}>
        <div className="relative h-[150px] bg-bg-soft">
          {cover ? (
            <Image
              src={cover.url}
              alt={unit.name}
              fill
              sizes="300px"
              className="object-cover"
              data-photo-filter={photoFilter ?? undefined}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-ink-soft/50">
              <ImageOff className="w-6 h-6" strokeWidth={1.5} />
            </div>
          )}
        </div>
        <div className="p-4 pb-2">
          <h2 className="text-[1rem] mb-1 group-hover:text-gold transition-colors">{unit.name}</h2>
          <p className="text-[0.82rem] text-ink-soft m-0">
            {unit.sizeSqm} · {unit.guests} · {unit.bedrooms}
          </p>
          <p className="text-[0.75rem] text-ink-soft/70 mt-1 m-0">
            {unit.images.length} {unit.images.length === 1 ? "Foto" : "Fotos"}
          </p>
        </div>
      </Link>
      <div className="flex items-center justify-between px-4 pb-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="Zum Sortieren ziehen"
            className="p-1 -ml-1 text-ink-soft hover:text-forest cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
          <span className="text-[0.68rem] tracking-[0.08em] uppercase text-ink-soft/60">
            Position {index + 1} von {total}
          </span>
        </div>
        <div className="flex gap-1">
          <form action={moveUp}>
            <button
              type="submit"
              disabled={index === 0}
              aria-label="Nach oben"
              className="p-1 text-ink-soft hover:text-forest disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </form>
          <form action={moveDown}>
            <button
              type="submit"
              disabled={index === total - 1}
              aria-label="Nach unten"
              className="p-1 text-ink-soft hover:text-forest disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowDown className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function WohnungenGrid({
  units,
  photoFilter,
}: {
  units: ApartmentWithImages[];
  photoFilter?: string | null;
}) {
  const [items, setItems] = useState(units);
  const [prevUnits, setPrevUnits] = useState(units);
  const [, startTransition] = useTransition();

  // Nach jedem Server-Refresh (Auf/Ab-Pfeile, revalidatePath nach Drag&Drop,
  // Foto-Filter-Aktionen, …) bekommt diese Komponente eine neue `units`-Prop
  // (neue Array-Referenz aus dem Server Component) — den lokalen Optimistic-
  // State direkt beim Rendern synchronisieren (React-empfohlenes Muster
  // "Adjusting state when a prop changes", vermeidet den Extra-Render-Zyklus
  // eines useEffect-basierten Syncs).
  if (units !== prevUnits) {
    setPrevUnits(units);
    setItems(units);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((u) => u.id === active.id);
    const newIndex = items.findIndex((u) => u.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    startTransition(() => {
      reorderApartments(reordered.map((u) => u.id));
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((u) => u.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-3 max-[860px]:grid-cols-2 max-[560px]:grid-cols-1 gap-5">
          {items.map((unit, i) => (
            <SortableCard key={unit.id} unit={unit} index={i} total={items.length} photoFilter={photoFilter} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
