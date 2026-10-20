"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadImages } from "@/components/listings/upload-images";
import { cn } from "cn";
import {
  CONDITION_LABELS,
  CURRENCIES,
  DEFAULT_CURRENCY,
  formatPrice,
} from "@/lib/format";
import type { CategoryOption } from "@/lib/listings-types";
import {
  CONDITION_VALUES,
  listingFormSchema,
  type ListingFormValues,
} from "@/lib/validations";

const STEPS = [
  { title: "Detalles", hint: "Contanos qué publicás" },
  { title: "Precio", hint: "Cuánto y dónde" },
  { title: "Fotos", hint: "Mostrá tu artículo" },
] as const;

/** Campos que valida cada paso antes de dejar avanzar. */
const STEP_FIELDS: Path<ListingFormValues>[][] = [
  ["title", "description", "categorySlug", "condition", "brand", "size"],
  ["price", "currency", "location"],
  ["images"],
];

/** Clases del `<select>` nativo, espejo de `<Input>`. */
const selectClass =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

export function SellForm({
  categories,
  initialValues,
  editId,
}: {
  categories: CategoryOption[];
  initialValues?: Partial<ListingFormValues>;
  editId?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [attemptedSteps, setAttemptedSteps] = useState<number[]>([]);
  const [publishAttempted, setPublishAttempted] = useState(false);
  const isEdit = Boolean(editId);
  void isEdit;

  const {
    register,
    handleSubmit,
    control,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    mode: "onTouched",
    defaultValues: initialValues
      ? {
          title: initialValues.title ?? "",
          description: initialValues.description ?? "",
          price: initialValues.price ?? 0,
          categorySlug: initialValues.categorySlug ?? categories[0]?.slug ?? "",
          condition: initialValues.condition ?? "good",
          brand: initialValues.brand ?? "",
          size: initialValues.size ?? "",
          currency: initialValues.currency ?? DEFAULT_CURRENCY,
          location: initialValues.location ?? "",
          images: initialValues.images ?? [],
        }
      : {
          title: "",
          description: "",
          categorySlug: categories[0]?.slug ?? "",
          condition: "good",
          brand: "",
          size: "",
          currency: DEFAULT_CURRENCY,
          location: "",
          images: [],
        },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        title: initialValues.title ?? "",
        description: initialValues.description ?? "",
        price: initialValues.price ?? 0,
        categorySlug: initialValues.categorySlug ?? categories[0]?.slug ?? "",
        condition: initialValues.condition ?? "good",
        brand: initialValues.brand ?? "",
        size: initialValues.size ?? "",
        currency: initialValues.currency ?? DEFAULT_CURRENCY,
        location: initialValues.location ?? "",
        images: initialValues.images ?? [],
      });
    }
  }, [initialValues, categories, reset]);

  const values = useWatch({ control });
  const currencySymbol =
    CURRENCIES.find((currency) => currency.code === values.currency)?.symbol ??
    "$";
  const imageCount = values.images?.length ?? 0;
  const isLastStep = step === STEPS.length - 1;

  // `trigger` evalúa el esquema completo, así que al cambiar de paso pueden
  // "prestarse" errores de pasos posteriores (p. ej. "Subí al menos una foto"
  // al llegar a Fotos). Mostramos los errores de un paso solo después de que el
  // usuario intente avanzar desde él (o tras intentar publicar).
  const showErrors = publishAttempted || attemptedSteps.includes(step);

  const priceValue = values.price;
  const summaryPrice =
    typeof priceValue === "number" && Number.isFinite(priceValue)
      ? formatPrice(
          Math.round(priceValue * 100),
          values.currency ?? DEFAULT_CURRENCY,
        )
      : "—";
  const summaryCondition = values.condition
    ? CONDITION_LABELS[values.condition]
    : "—";

  async function goNext() {
    setAttemptedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));

    const valid = await trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (!valid) return;

    setStep(Math.min(step + 1, STEPS.length - 1));
  }

  const submitListing = handleSubmit(async (data) => {
    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const payload = (await response.json().catch(() => null)) as
        | { id?: string; error?: string }
        | null;

      if (!response.ok || !payload?.id) {
        throw new Error(payload?.error ?? "No se pudo publicar el anuncio.");
      }

      toast.success("¡Tu artículo ya está publicado!");
      router.push(`/listings/${payload.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Ocurrió un error inesperado.",
      );
    }
  });

  /**
   * Publica el anuncio desde el último paso.
   *
   * No usamos `type="submit"`: al pasar de "Precio" a "Fotos" el botón cambiaba
   * de `type="button"` a `type="submit"` **en el mismo nodo del DOM** (React lo
   * reutiliza), así que el navegador procesaba el envío con el paso ya avanzado
   * y revelaba (o publicaba) antes de tiempo. Con un botón normal el envío es
   * siempre explícito.
   */
  function publish() {
    setPublishAttempted(true);
    void submitListing();
  }

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
      {/* Indicador de pasos */}
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {STEPS.map((item, index) => {
          const isActive = index === step;
          const isDone = index < step;
          return (
            <li key={item.title} className="flex items-center gap-3">
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-full border text-sm font-semibold transition-colors",
                  isActive && "border-primary bg-primary text-primary-foreground",
                  isDone && "border-primary/30 bg-primary/10 text-primary",
                  !isActive &&
                    !isDone &&
                    "border-border bg-muted text-muted-foreground",
                )}
                aria-current={isActive ? "step" : undefined}
              >
                {isDone ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.title}
              </span>
              {index < STEPS.length - 1 && (
                <ChevronRight
                  className="size-4 text-muted-foreground/60"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-6">
        <h2 className="text-lg font-semibold tracking-tight">
          {STEPS[step].title}
        </h2>
        <p className="text-sm text-muted-foreground">{STEPS[step].hint}</p>
      </div>

      <form onSubmit={(event) => event.preventDefault()} className="mt-6 space-y-6" noValidate>
        <ShowFieldErrors value={showErrors}>
        {step === 0 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Ej: Bicicleta de ruta Specialized Allez 54"
                aria-invalid={Boolean(errors.title)}
                {...register("title")}
              />
              <FieldError message={errors.title?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Detallá el estado, el uso, los componentes y cualquier detalle relevante."
                aria-invalid={Boolean(errors.description)}
                {...register("description")}
              />
              <FieldError message={errors.description?.message} />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="categorySlug">Categoría</Label>
                <select
                  id="categorySlug"
                  className={selectClass}
                  aria-invalid={Boolean(errors.categorySlug)}
                  {...register("categorySlug")}
                >
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.categorySlug?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condición</Label>
                <select
                  id="condition"
                  className={selectClass}
                  aria-invalid={Boolean(errors.condition)}
                  {...register("condition")}
                >
                  {CONDITION_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {CONDITION_LABELS[value]}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.condition?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Marca (opcional)</Label>
                <Input
                  id="brand"
                  placeholder="Ej: Trek"
                  aria-invalid={Boolean(errors.brand)}
                  {...register("brand")}
                />
                <FieldError message={errors.brand?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Talla (opcional)</Label>
                <Input
                  id="size"
                  placeholder="Ej: M / 54"
                  aria-invalid={Boolean(errors.size)}
                  {...register("size")}
                />
                <FieldError message={errors.size?.message} />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-[1fr_12rem]">
              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {currencySymbol}
                  </span>
                  <Input
                    id="price"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    placeholder="0"
                    className="pl-9"
                    aria-invalid={Boolean(errors.price)}
                    {...register("price", { valueAsNumber: true })}
                  />
                </div>
                <FieldError message={errors.price?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <select
                  id="currency"
                  className={selectClass}
                  aria-invalid={Boolean(errors.currency)}
                  {...register("currency")}
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} · {currency.label}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.currency?.message} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                placeholder="Ej: Palermo, CABA"
                aria-invalid={Boolean(errors.location)}
                {...register("location")}
              />
              <FieldError message={errors.location?.message} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Controller
              control={control}
              name="images"
              render={({ field }) => (
                <UploadImages
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              )}
            />
            <FieldError message={errors.images?.message} />

            {/* Resumen antes de publicar */}
            <dl className="grid gap-3 rounded-2xl border bg-muted/30 p-4 text-sm sm:grid-cols-2">
              <SummaryItem label="Título" value={values.title || "—"} />
              <SummaryItem
                label="Precio"
                value={summaryPrice}
              />
              <SummaryItem
                label="Categoría"
                value={
                  categories.find((c) => c.slug === values.categorySlug)?.name ??
                  "—"
                }
              />
              <SummaryItem label="Ubicación" value={values.location || "—"} />
              <SummaryItem label="Condición" value={summaryCondition} />
              <SummaryItem
                label="Fotos"
                value={`${imageCount} ${imageCount === 1 ? "foto" : "fotos"}`}
              />
            </dl>
          </div>
        )}

        </ShowFieldErrors>

        {/* Navegación */}
        <div className="flex items-center justify-between gap-3 border-t pt-5">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 0 || isSubmitting}
            onClick={() => setStep((current) => Math.max(current - 1, 0))}
          >
            <ChevronLeft aria-hidden="true" />
            Atrás
          </Button>

          {isLastStep ? (
            <Button type="button" size="lg" disabled={isSubmitting} onClick={publish}>
              {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
              {isSubmitting ? "Publicando…" : "Publicar artículo"}
            </Button>
          ) : (
            <Button type="button" size="lg" onClick={goNext}>
              Siguiente
              <ChevronRight aria-hidden="true" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

/**
 * Controla la visibilidad de los mensajes de error por paso.
 *
 * `trigger` valida el esquema completo, así que puede haber errores de campos
 * que todavía no se ven; el contexto evita mostrarlos antes de tiempo.
 */
const ShowFieldErrors = createContext(true);

function FieldError({ message }: { message?: string }) {
  const show = useContext(ShowFieldErrors);
  if (!show || !message) return null;
  return (
    <p role="alert" className="text-xs text-destructive">
      {message}
    </p>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  );
}
