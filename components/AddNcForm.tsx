// Caminho: components/AddNcForm.tsx (VALIDAÇÃO SIMPLIFICADA)
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

// --- Schema SIMPLIFICADO (valortotal como string não vazia) ---
const formSchema = z.object({
  numeronc: z.string().min(5, { message: "Número da NC é obrigatório." }),
  datarecepcao: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Data inválida."}),
  ug_gestora: z.string().length(6, { message: "UG Gestora deve ter 6 dígitos." }),
  ug_favorecida: z.string().length(6, { message: "UG Favorecida deve ter 6 dígitos." }),
  ptres: z.string().min(1, { message: "PTRES é obrigatório."}),
  naturezadespesa: z.string().min(6, { message: "ND é obrigatória."}),
  fonterecurso: z.string().min(1, { message: "Fonte é obrigatória."}),
  pi: z.string().optional(),
  // Simplificado: Apenas string não vazia que pareça número (sem .transform)
  valortotal: z.string()
      .min(1, { message: "Valor total é obrigatório."})
      .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), {
          message: "Valor inválido (use ponto para decimal, ex: 1500.50).",
      }),
  datavalidade: z.string().refine((date) => date === "" || !isNaN(Date.parse(date)), { message: "Data inválida."}).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

type AddNcFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

export function AddNcForm({ onSuccess, onCancel }: AddNcFormProps) {
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema), // Valida usando o formSchema (string)
    defaultValues: {
      numeronc: "", datarecepcao: new Date().toISOString().split('T')[0],
      ug_gestora: "", ug_favorecida: "", ptres: "", naturezadespesa: "",
      fonterecurso: "", pi: "", valortotal: "", datavalidade: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    setSubmitError(null);

    // --- Conversão Manual para Número ANTES de inserir ---
    const valorTotalNumber = parseFloat(values.valortotal);
    if (isNaN(valorTotalNumber) || valorTotalNumber < 0) {
        setSubmitError("Valor total inválido ou negativo.");
        setIsSubmitting(false);
        return; // Interrompe o envio
    }
    // ---------------------------------------------------

    try {
        const dataToInsert = {
            numeronc: values.numeronc, datarecepcao: values.datarecepcao,
            ug_gestora: values.ug_gestora, ug_favorecida: values.ug_favorecida,
            ptres: values.ptres, naturezadespesa: values.naturezadespesa,
            fonterecurso: values.fonterecurso,
            pi: values.pi || null,
            valortotal: valorTotalNumber, // <-- Usa o número convertido
            datavalidade: values.datavalidade || null,
        };
        console.log("Dados para inserir:", dataToInsert);

        const { error } = await supabase.from("NotasCredito").insert([dataToInsert]);
        if (error) throw error;

        console.log("NC inserida com sucesso!");
        onSuccess();

    } catch (error: any) {
        console.error("Erro ao inserir NC:", error);
        // Usa error.issues se for ZodError (improvável com schema simplificado)
        setSubmitError(`Erro ao salvar: ${error.issues ? error.issues.map((e: any) => e.message).join(', ') : error.message || 'Erro desconhecido'}`);
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Campos do formulário (sem alterações aqui) */}
        <FormField control={form.control} name="numeronc" render={({ field }) => ( <FormItem> <FormLabel>Número da NC</FormLabel> <FormControl> <Input placeholder="Ex: 2024NC001234" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="datarecepcao" render={({ field }) => ( <FormItem> <FormLabel>Data de Recepção</FormLabel> <FormControl> <Input type="date" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="ug_gestora" render={({ field }) => ( <FormItem> <FormLabel>UG Gestora</FormLabel> <FormControl> <Input placeholder="6 dígitos" maxLength={6} {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="ug_favorecida" render={({ field }) => ( <FormItem> <FormLabel>UG Favorecida</FormLabel> <FormControl> <Input placeholder="6 dígitos" maxLength={6} {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
        </div>
        <div className="grid grid-cols-3 gap-4">
            <FormField control={form.control} name="ptres" render={({ field }) => ( <FormItem> <FormLabel>PTRES</FormLabel> <FormControl> <Input placeholder="Ex: 001001" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="naturezadespesa" render={({ field }) => ( <FormItem> <FormLabel>Natureza Despesa</FormLabel> <FormControl> <Input placeholder="Ex: 33903000" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="fonterecurso" render={({ field }) => ( <FormItem> <FormLabel>Fonte Recurso</FormLabel> <FormControl> <Input placeholder="Ex: 0100" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
        </div>
        <FormField control={form.control} name="pi" render={({ field }) => ( <FormItem> <FormLabel>Plano Interno (PI)</FormLabel> <FormControl> <Input placeholder="Opcional" {...field} /> </FormControl> <FormDescription>Se aplicável.</FormDescription> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="valortotal" render={({ field }) => ( <FormItem> <FormLabel>Valor Total (R$)</FormLabel> <FormControl> <Input type="text" inputMode="decimal" placeholder="Ex: 1500.50 (use ponto)" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="datavalidade" render={({ field }) => ( <FormItem> <FormLabel>Data de Validade</FormLabel> <FormControl> <Input type="date" {...field} /> </FormControl> <FormDescription>Opcional.</FormDescription> <FormMessage /> </FormItem> )}/>

        {submitError && (<p className="text-sm font-medium text-destructive">{submitError}</p>)}
        <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}> Cancelar </Button>
            <Button type="submit" disabled={isSubmitting}> {isSubmitting ? 'Salvando...' : 'Salvar Nota de Crédito'} </Button>
        </div>
      </form>
    </Form>
  );
}