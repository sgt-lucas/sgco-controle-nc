// Caminho: components/AddNcForm.tsx (CORRIGIDO com Schema Duplo)
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

// --- Schema para o FORMULÁRIO (valortotal como string) ---
const formSchema = z.object({
  numeronc: z.string().min(5, { message: "Número da NC é obrigatório." }),
  datarecepcao: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Data inválida."}), // Validação simples de data
  ug_gestora: z.string().length(6, { message: "UG Gestora deve ter 6 dígitos." }),
  ug_favorecida: z.string().length(6, { message: "UG Favorecida deve ter 6 dígitos." }),
  ptres: z.string().min(1, { message: "PTRES é obrigatório."}),
  naturezadespesa: z.string().min(6, { message: "ND é obrigatória."}),
  fonterecurso: z.string().min(1, { message: "Fonte é obrigatória."}),
  pi: z.string().optional(),
  valortotal: z.string() // Valortotal é uma string no formulário
    .refine((val) => val === "" || /^\d+(\.\d{1,2})?$/.test(val), { // Permite vazio ou número (com até 2 decimais)
        message: "Valor inválido (use ponto para decimal).",
    }),
  datavalidade: z.string().refine((date) => date === "" || !isNaN(Date.parse(date)), { message: "Data inválida."}).optional().or(z.literal('')),
});

// --- Schema para os DADOS PROCESSADOS (valortotal como number) ---
const processedSchema = formSchema.extend({
    valortotal: formSchema.shape.valortotal
        .transform((val) => (val === "" ? 0 : parseFloat(val))) // Transforma string em número
        .refine((num) => num >= 0, { message: "Valor não pode ser negativo." }), // Valida o número
    // Garante que PI e datavalidade sejam null se opcionais e vazios
    pi: z.string().optional().transform(val => val === "" ? null : val),
    datavalidade: z.string().optional().transform(val => val === "" ? null : val),
});

// Tipagem inferida a partir do schema DO FORMULÁRIO
type FormValues = z.infer<typeof formSchema>;

type AddNcFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

export function AddNcForm({ onSuccess, onCancel }: AddNcFormProps) {
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Usa o formSchema para o react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema), // Valida usando o formSchema (string)
    defaultValues: {
      numeronc: "",
      datarecepcao: new Date().toISOString().split('T')[0],
      ug_gestora: "",
      ug_favorecida: "",
      ptres: "",
      naturezadespesa: "",
      fonterecurso: "",
      pi: "",
      valortotal: "", // Default como string vazia
      datavalidade: "",
    },
  });

  // Função de submit recebe os valores VALIDADOS pelo formSchema
  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
        // --- Processa/Transforma os valores validados usando o processedSchema ---
        const processedValues = processedSchema.parse(values);
        console.log("Valores processados:", processedValues); // valortotal será number aqui

        // Mapeia os valores PROCESSADOS para o schema do banco (minúsculas)
        const dataToInsert = {
            numeronc: processedValues.numeronc,
            datarecepcao: processedValues.datarecepcao,
            ug_gestora: processedValues.ug_gestora,
            ug_favorecida: processedValues.ug_favorecida,
            ptres: processedValues.ptres,
            naturezadespesa: processedValues.naturezadespesa,
            fonterecurso: processedValues.fonterecurso,
            pi: processedValues.pi, // Já é null se vazio
            valortotal: processedValues.valortotal, // Já é number
            datavalidade: processedValues.datavalidade, // Já é null se vazio
        };

        console.log("Dados para inserir:", dataToInsert);

        const { error } = await supabase
          .from("NotasCredito")
          .insert([dataToInsert]);

        if (error) {
          throw error; // Joga o erro para o catch
        } else {
          console.log("NC inserida com sucesso!");
          onSuccess();
        }

    } catch (error: any) {
        console.error("Erro ao processar ou inserir NC:", error);
        // Se for erro de validação do processedSchema (pouco provável aqui, mas possível)
        if (error instanceof z.ZodError) {
             setSubmitError(`Erro de validação interna: ${error.errors.map(e => e.message).join(', ')}`);
        } else {
             setSubmitError(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
        }
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      {/* O onSubmit agora usa form.handleSubmit(onSubmit), que valida com formSchema */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Número NC */}
        <FormField
          control={form.control}
          name="numeronc"
          render={({ field }) => ( <FormItem> <FormLabel>Número da NC</FormLabel> <FormControl> <Input placeholder="Ex: 2024NC001234" {...field} /> </FormControl> <FormMessage /> </FormItem> )}
        />
        {/* Data Recepção */}
         <FormField
          control={form.control}
          name="datarecepcao"
          render={({ field }) => ( <FormItem> <FormLabel>Data de Recepção</FormLabel> <FormControl> <Input type="date" {...field} /> </FormControl> <FormMessage /> </FormItem> )}
        />
        {/* UGs */}
        <div className="grid grid-cols-2 gap-4">
             <FormField control={form.control} name="ug_gestora" render={({ field }) => ( <FormItem> <FormLabel>UG Gestora</FormLabel> <FormControl> <Input placeholder="6 dígitos" maxLength={6} {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
             <FormField control={form.control} name="ug_favorecida" render={({ field }) => ( <FormItem> <FormLabel>UG Favorecida</FormLabel> <FormControl> <Input placeholder="6 dígitos" maxLength={6} {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
        </div>
        {/* PTRES, ND, Fonte */}
        <div className="grid grid-cols-3 gap-4">
             <FormField control={form.control} name="ptres" render={({ field }) => ( <FormItem> <FormLabel>PTRES</FormLabel> <FormControl> <Input placeholder="Ex: 001001" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
             <FormField control={form.control} name="naturezadespesa" render={({ field }) => ( <FormItem> <FormLabel>Natureza Despesa</FormLabel> <FormControl> <Input placeholder="Ex: 33903000" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
             <FormField control={form.control} name="fonterecurso" render={({ field }) => ( <FormItem> <FormLabel>Fonte Recurso</FormLabel> <FormControl> <Input placeholder="Ex: 0100" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
        </div>
        {/* PI */}
        <FormField control={form.control} name="pi" render={({ field }) => ( <FormItem> <FormLabel>Plano Interno (PI)</FormLabel> <FormControl> <Input placeholder="Opcional" {...field} /> </FormControl> <FormDescription>Se aplicável.</FormDescription> <FormMessage /> </FormItem> )}/>
        {/* Valor Total */}
        <FormField
            control={form.control}
            name="valortotal" // Este campo agora espera uma string
            render={({ field }) => (
            <FormItem>
                <FormLabel>Valor Total (R$)</FormLabel>
                <FormControl>
                    {/* Input type="text" é mais flexível para validação de string */}
                <Input type="text" inputMode="decimal" placeholder="Ex: 1500.50 (use ponto)" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        {/* Data Validade */}
         <FormField
          control={form.control}
          name="datavalidade"
          render={({ field }) => ( <FormItem> <FormLabel>Data de Validade</FormLabel> <FormControl> <Input type="date" {...field} /> </FormControl> <FormDescription>Opcional.</FormDescription> <FormMessage /> </FormItem> )}
        />
        {submitError && (<p className="text-sm font-medium text-destructive">{submitError}</p>)}
        <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}> Cancelar </Button>
             <Button type="submit" disabled={isSubmitting}> {isSubmitting ? 'Salvando...' : 'Salvar Nota de Crédito'} </Button>
        </div>
      </form>
    </Form>
  );
}