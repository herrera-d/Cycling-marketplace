"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ALLOWED_IMAGE_TYPES_LABEL,
  MAX_IMAGE_MEGABYTES,
  MAX_LISTING_IMAGES,
  validateImageFile,
} from "@/lib/image-constraints";
import { cn } from "cn";

type UploadImagesProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
};

/** Sube un archivo a `/api/upload` y devuelve su URL pública. */
async function uploadOne(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);

  const response = await fetch("/api/upload", { method: "POST", body });
  const data = (await response.json().catch(() => null)) as
    | { url?: string; error?: string }
    | null;

  if (!response.ok || !data?.url) {
    throw new Error(data?.error ?? "No se pudo subir la imagen.");
  }

  return data.url;
}

/**
 * Subidor de fotos del anuncio (PLAN §5.5 y §6.2).
 *
 * - Arrastrar y soltar o elegir archivos (múltiples).
 * - Validación de tipo/tamaño en el cliente (el servidor revalida).
 * - Vista previa con portada, reordenar y eliminar.
 * - Sube de a una para no saturar y muestra el progreso.
 */
export function UploadImages({ value, onChange, disabled }: UploadImagesProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [pending, setPending] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const isBusy = pending > 0;
  const canAddMore = value.length < MAX_LISTING_IMAGES;

  async function handleFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList);
    if (incoming.length === 0) return;

    const nextErrors: string[] = [];
    const accepted: File[] = [];

    const slots = MAX_LISTING_IMAGES - value.length;
    if (slots <= 0) {
      setErrors([`Ya alcanzaste el máximo de ${MAX_LISTING_IMAGES} fotos.`]);
      return;
    }

    for (const file of incoming) {
      if (accepted.length >= slots) {
        nextErrors.push(`Solo se subieron ${slots} imágenes (límite alcanzado).`);
        break;
      }
      const invalid = validateImageFile(file);
      if (invalid) {
        nextErrors.push(`${file.name}: ${invalid}`);
        continue;
      }
      accepted.push(file);
    }

    setErrors(nextErrors);
    if (accepted.length === 0) return;

    setPending(accepted.length);

    // Subida secuencial: acumulamos las URLs y avisamos al formulario.
    const uploaded: string[] = [];
    for (const file of accepted) {
      try {
        uploaded.push(await uploadOne(file));
        onChange([...value, ...uploaded]);
      } catch (error) {
        nextErrors.push(
          error instanceof Error ? error.message : "Error al subir la imagen.",
        );
        setErrors([...nextErrors]);
      } finally {
        setPending((count) => Math.max(count - 1, 0));
      }
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (disabled || isBusy) return;
    void handleFiles(event.dataTransfer.files);
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    const current = next[index];
    const swap = next[target];
    if (current === undefined || swap === undefined) return;
    next[index] = swap;
    next[target] = current;
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled && !isBusy) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30",
          (disabled || !canAddMore) && "opacity-60",
        )}
      >
        <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          {isBusy ? (
            <Loader2 className="size-6 animate-spin" aria-hidden="true" />
          ) : (
            <UploadCloud className="size-6" aria-hidden="true" />
          )}
        </span>

        <div className="space-y-1">
          <p className="text-sm font-medium">
            {isBusy
              ? `Subiendo ${pending} ${pending === 1 ? "imagen" : "imágenes"}…`
              : "Arrastrá tus fotos o elegí archivos"}
          </p>
          <p className="text-xs text-muted-foreground">
            {ALLOWED_IMAGE_TYPES_LABEL} · hasta {MAX_IMAGE_MEGABYTES} MB · máx.{" "}
            {MAX_LISTING_IMAGES} fotos
          </p>
        </div>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="sr-only"
          disabled={disabled || isBusy || !canAddMore}
          onChange={(event) => {
            if (event.target.files) void handleFiles(event.target.files);
            event.target.value = "";
          }}
        />

        <Button
          type="button"
          variant="outline"
          disabled={disabled || isBusy || !canAddMore}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus aria-hidden="true" />
          {canAddMore ? "Elegir fotos" : "Límite alcanzado"}
        </Button>
      </div>

      {errors.length > 0 && (
        <ul
          role="alert"
          className="space-y-1 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      {value.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {value.map((url, index) => (
            <li
              key={url}
              className="group relative overflow-hidden rounded-2xl border bg-muted"
            >
              <div className="relative aspect-square">
                <Image
                  src={url}
                  alt={`Foto ${index + 1} del anuncio`}
                  fill
                  sizes="(min-width: 640px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>

              {index === 0 && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium shadow-sm backdrop-blur">
                  <Star className="size-3 fill-current" aria-hidden="true" />
                  Portada
                </span>
              )}

              <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="size-8 bg-background/90 backdrop-blur"
                    aria-label={`Mover la foto ${index + 1} a la izquierda`}
                    disabled={disabled || index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowLeft aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="size-8 bg-background/90 backdrop-blur"
                    aria-label={`Mover la foto ${index + 1} a la derecha`}
                    disabled={disabled || index === value.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </div>

                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="size-8 backdrop-blur"
                  aria-label={`Eliminar la foto ${index + 1}`}
                  disabled={disabled}
                  onClick={() => removeAt(index)}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-muted-foreground" aria-live="polite">
        {value.length}/{MAX_LISTING_IMAGES} fotos. La primera es la portada.
      </p>
    </div>
  );
}
