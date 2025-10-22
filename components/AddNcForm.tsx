// Caminho: components/AddNcForm.tsx
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

// Schema de validação Zod (ajuste conforme necessidade, ex: tamanho dos campos)
const formSchema = z.object({
  numeronc: z.string().min(5, { message: "Número da NC é obrigatório." }),
  datarecepcao: z.string().date("Data inválida."), // Espera 'YYYY-MM-DD'
  ug_gestora: z.string().length(6, { message: "UG Gestora deve ter 6 dígitos." }),
  ug_favorecida: z.string().length(6, { message: "UG Favorecida deve ter 6 dígitos." }),
  ptres: z.string().min(1, { message: "PTRES é obrigatório."}),
  naturezadespesa: z.string().min(6, { message: "ND é obrigatória."}), // Ex: 339030
  fonterecurso: z.string().min(1, { message: "Fonte é obrigatória."}),
  pi: z.string().optional(), // PI é opcional
  // --- Linha Corrigida ---
  valortotal: z.preprocess(
      (val) => (val === "" ? undefined : Number(val)), // Converte string vazia/undefined para NaN ou número
      z.number({ invalid_type_error: "Valor inválido."}).positive({ message: "Valor deve ser positivo." })
  ),
  // ----------------------
  datavalidade: z.string().date("Data inválida.").optional().or(z.literal('')), // Opcional, aceita vazio
});

// Tipagem para as props do componente
type AddNcFormProps = {
  onSuccess: () => void; // Função para chamar após sucesso (ex: fechar modal, atualizar lista)
  onCancel: () => void;  // Função para chamar ao cancelar
};

export function AddNcForm({ onSuccess, onCancel }: AddNcFormProps) {
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 1. Define o formulário.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { // Valores iniciais (opcional)
      numeronc: "",
      datarecepcao: new Date().toISOString().split('T')[0], // Hoje como padrão
      ug_gestora: "",
      ug_favorecida: "",
      ptres: "",
      naturezadespesa: "",
      fonterecurso: "",
      pi: "",
      valortotal: 0,
      datavalidade: "",
    },
  });

  // 2. Define a função de submit.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setSubmitError(null);
    console.log("Valores do formulário:", values); // Para debug

    // Mapeia os valores do formulário para o schema do banco (minúsculas)
    const dataToInsert = {
        numeronc: values.numeronc,
        datarecepcao: values.datarecepcao,
        ug_gestora: values.ug_gestora, // Assumindo coluna ug_gestora no DB
        ug_favorecida: values.ug_favorecida, // Assumindo coluna ug_favorecida no DB
        ptres: values.ptres,
        naturezadespesa: values.naturezadespesa,
        fonterecurso: values.fonterecurso,
        pi: values.pi || null, // Garante null se vazio
        valortotal: values.valortotal,
        datavalidade: values.datavalidade || null, // Garante null se vazio
        // O SaldoDisponivel será calculado pelo Trigger no DB
    };

    console.log("Dados para inserir:", dataToInsert); // Para debug

    const { error } = await supabase
      .from("NotasCredito") // Nome da tabela
      .insert([dataToInsert]); // insert espera um array

    setIsSubmitting(false);

    if (error) {
      console.error("Erro ao inserir NC:", error);
      setSubmitError(`Erro ao salvar: ${error.message}`);
    } else {
      console.log("NC inserida com sucesso!");
      onSuccess(); // Chama a função de sucesso (fechar modal, etc.)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Número NC */}
        <FormField
          control={form.control}
          name="numeronc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número da NC</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 2024NC001234" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Data Recepção */}
         <FormField
          control={form.control}
          name="datarecepcao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Recepção</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* UG Gestora e Favorecida (lado a lado) */}
        <div className="grid grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="ug_gestora"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>UG Gestora</FormLabel>
                    <FormControl>
                        <Input placeholder="6 dígitos" maxLength={6} {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
                control={form.control}
                name="ug_favorecida"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>UG Favorecida</FormLabel>
                    <FormControl>
                        <Input placeholder="6 dígitos" maxLength={6} {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
        </div>

        {/* PTRES, ND, Fonte (lado a lado) */}
        <div className="grid grid-cols-3 gap-4">
             <FormField
                control={form.control}
                name="ptres"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>PTRES</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: 001001" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
             <FormField
                control={form.control}
                name="naturezadespesa"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Natureza Despesa</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: 33903000" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
             <FormField
                control={form.control}
                name="fonterecurso"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Fonte Recurso</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: 0100" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
        </div>

        {/* PI (Plano Interno) */}
        <FormField
            control={form.control}
            name="pi"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Plano Interno (PI)</FormLabel>
                <FormControl>
                <Input placeholder="Opcional" {...field} />
                </FormControl>
                <FormDescription>Se aplicável.</FormDescription>
                <FormMessage />
            </FormItem>
            )}
        />

        {/* Valor Total */}
        <FormField
            control={form.control}
            name="valortotal"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Valor Total (R$)</FormLabel>
                <FormControl>
                    {/* step="0.01" permite centavos */}
                <Input type="number" step="0.01" placeholder="Ex: 1500.50" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />

        {/* Data Validade */}
         <FormField
          control={form.control}
          name="datavalidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Validade</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
               <FormDescription>Opcional. Data limite para empenho.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Mensagem de Erro do Submit */}
        {submitError && (
          <p className="text-sm font-medium text-destructive">{submitError}</p>
        )}

        {/* Botões */}
        <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancelar
            </Button>
             <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Nota de Crédito'}
            </Button>
        </div>
      </form>
    </Form>
  );
}

// Nota: Certifique-se que as colunas 'ug_gestora' e 'ug_favorecida'
// existem na sua tabela 'NotasCredito' no Supabase. Se não, ajuste o schema SQL
// e o objeto 'dataToInsert' acima.