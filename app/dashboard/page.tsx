// Caminho: components/AddNcForm.tsx (Reconstruído sem shadcn Form/FormField)
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form"; // Importa SubmitHandler
import { z } from "zod";
import { useState } from "react";

// Importa apenas os componentes visuais necessários do shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Não importamos mais Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage

import { createClient } from "@/lib/supabase/client";

// --- Schema SIMPLIFICADO (valortotal como string não vazia) ---
// Este schema passou no build anteriormente
const formSchema = z.object({
  numeronc: z.string().min(5, { message: "Número da NC é obrigatório." }),
  datarecepcao: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Data inválida."}),
  ug_gestora: z.string().length(6, { message: "UG Gestora deve ter 6 dígitos." }),
  ug_favorecida: z.string().length(6, { message: "UG Favorecida deve ter 6 dígitos." }),
  ptres: z.string().min(1, { message: "PTRES é obrigatório."}),
  naturezadespesa: z.string().min(6, { message: "ND é obrigatória."}),
  fonterecurso: z.string().min(1, { message: "Fonte é obrigatória."}),
  pi: z.string().optional(),
  valortotal: z.string()
      .min(1, { message: "Valor total é obrigatório."})
      .refine((val) => /^\d+([.,]\d{1,2})?$/.test(val), { // Aceita vírgula ou ponto
          message: "Valor inválido (use ponto ou vírgula para decimais).",
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

  // Configuração do react-hook-form (sem shadcn Form)
  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormValues>({
    resolver: zodResolver(formSchema), // Continua a usar Zod para validação
    defaultValues: {
      numeronc: "", datarecepcao: new Date().toISOString().split('T')[0],
      ug_gestora: "", ug_favorecida: "", ptres: "", naturezadespesa: "",
      fonterecurso: "", pi: "", valortotal: "", datavalidade: "",
    },
  });

  // Função onSubmit agora usa SubmitHandler para tipagem correta
  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Conversão e Validação Manual do Valor (mantida da versão anterior)
    const valorTotalString = values.valortotal.replace(',', '.');
    const valorTotalNumber = parseFloat(valorTotalString);

    if (isNaN(valorTotalNumber) || valorTotalNumber < 0) {
        // Usa setError do react-hook-form para mostrar erro no campo
        setError("valortotal", { type: "manual", message: "Valor inválido ou negativo." });
        setIsSubmitting(false);
        return;
    }

    try {
        const dataToInsert = {
            numeronc: values.numeronc, datarecepcao: values.datarecepcao,
            ug_gestora: values.ug_gestora, ug_favorecida: values.ug_favorecida,
            ptres: values.ptres, naturezadespesa: values.naturezadespesa,
            fonterecurso: values.fonterecurso,
            pi: values.pi || null,
            valortotal: valorTotalNumber, // Usa o número convertido
            datavalidade: values.datavalidade || null,
        };
        console.log("Dados para inserir:", dataToInsert);

        const { error } = await supabase.from("NotasCredito").insert([dataToInsert]);
        if (error) throw error;

        console.log("NC inserida com sucesso!");
        onSuccess();

    } catch (error: any) {
        console.error("Erro ao inserir NC:", error);
        setSubmitError(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- JSX usa <form> padrão e liga campos com register ---
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Exemplo: Número NC */}
      <div className="space-y-2">
        <Label htmlFor="numeronc">Número da NC</Label>
        <Input id="numeronc" placeholder="Ex: 2024NC001234" {...register("numeronc")} aria-invalid={errors.numeronc ? "true" : "false"}/>
        {errors.numeronc && <p className="text-sm font-medium text-destructive">{errors.numeronc.message}</p>}
      </div>

      {/* Exemplo: Data Recepção */}
      <div className="space-y-2">
        <Label htmlFor="datarecepcao">Data de Recepção</Label>
        <Input id="datarecepcao" type="date" {...register("datarecepcao")} aria-invalid={errors.datarecepcao ? "true" : "false"}/>
        {errors.datarecepcao && <p className="text-sm font-medium text-destructive">{errors.datarecepcao.message}</p>}
      </div>

      {/* UGs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="ug_gestora">UG Gestora</Label>
            <Input id="ug_gestora" placeholder="6 dígitos" maxLength={6} {...register("ug_gestora")} aria-invalid={errors.ug_gestora ? "true" : "false"}/>
            {errors.ug_gestora && <p className="text-sm font-medium text-destructive">{errors.ug_gestora.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="ug_favorecida">UG Favorecida</Label>
            <Input id="ug_favorecida" placeholder="6 dígitos" maxLength={6} {...register("ug_favorecida")} aria-invalid={errors.ug_favorecida ? "true" : "false"}/>
            {errors.ug_favorecida && <p className="text-sm font-medium text-destructive">{errors.ug_favorecida.message}</p>}
        </div>
      </div>

       {/* PTRES, ND, Fonte */}
        <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2"> <Label htmlFor="ptres">PTRES</Label> <Input id="ptres" placeholder="Ex: 001001" {...register("ptres")} aria-invalid={errors.ptres ? "true" : "false"}/> {errors.ptres && <p className="text-sm font-medium text-destructive">{errors.ptres.message}</p>} </div>
            <div className="space-y-2"> <Label htmlFor="naturezadespesa">Natureza Despesa</Label> <Input id="naturezadespesa" placeholder="Ex: 33903000" {...register("naturezadespesa")} aria-invalid={errors.naturezadespesa ? "true" : "false"}/> {errors.naturezadespesa && <p className="text-sm font-medium text-destructive">{errors.naturezadespesa.message}</p>} </div>
            <div className="space-y-2"> <Label htmlFor="fonterecurso">Fonte Recurso</Label> <Input id="fonterecurso" placeholder="Ex: 0100" {...register("fonterecurso")} aria-invalid={errors.fonterecurso ? "true" : "false"}/> {errors.fonterecurso && <p className="text-sm font-medium text-destructive">{errors.fonterecurso.message}</p>} </div>
        </div>

      {/* PI */}
      <div className="space-y-2">
        <Label htmlFor="pi">Plano Interno (PI)</Label>
        <Input id="pi" placeholder="Opcional" {...register("pi")} />
        <p className="text-[0.8rem] text-muted-foreground">Se aplicável.</p>
        {/* Não há erro Zod direto para campo opcional sem validação extra */}
      </div>

      {/* Valor Total */}
       <div className="space-y-2">
        <Label htmlFor="valortotal">Valor Total (R$)</Label>
        <Input id="valortotal" type="text" inputMode="decimal" placeholder="Ex: 1500.50 (use ponto ou vírgula)" {...register("valortotal")} aria-invalid={errors.valortotal ? "true" : "false"}/>
        {errors.valortotal && <p className="text-sm font-medium text-destructive">{errors.valortotal.message}</p>}
      </div>

       {/* Data Validade */}
       <div className="space-y-2">
        <Label htmlFor="datavalidade">Data de Validade</Label>
        <Input id="datavalidade" type="date" {...register("datavalidade")} aria-invalid={errors.datavalidade ? "true" : "false"}/>
        <p className="text-[0.8rem] text-muted-foreground">Opcional.</p>
        {errors.datavalidade && <p className="text-sm font-medium text-destructive">{errors.datavalidade.message}</p>}
      </div>

      {/* Mensagem de Erro Geral do Submit */}
      {submitError && (<p className="text-sm font-medium text-destructive">{submitError}</p>)}

      {/* Botões */}
      <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}> Cancelar </Button>
          <Button type="submit" disabled={isSubmitting}> {isSubmitting ? 'Salvando...' : 'Salvar Nota de Crédito'} </Button>
      </div>
    </form>
  );
}