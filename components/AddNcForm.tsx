// Caminho: components/AddNcForm.tsx (Atualizado com Novas Validações)
'use client';

import { zodResolver } from '@mantine/form';
import { useForm } from '@mantine/form'; // Usar o useForm do Mantine
import { z } from "zod";
import { useState } from "react";

import {
  TextInput,
  NumberInput,
  Button,
  Stack,
  Group,
  Alert,
  Grid,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { createClient } from '@/lib/supabase/client';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';

// --- Schema Atualizado ---
const formSchema = z.object({
  numeronc: z.string()
    .min(1, "Número da NC é obrigatório.") // Mensagem genérica inicial
    .regex(/^2025NC\d{6}$/, { message: "Formato inválido. Use 2025NC######." }),
  datarecepcao: z.date({ required_error: "Data de recepção é obrigatória.", invalid_type_error: "Data inválida." }),
  ug_gestora: z.string()
    .min(1, "UG Gestora é obrigatória.")
    .regex(/^\d{6}$/, { message: "UG Gestora deve ter 6 dígitos." }),
  // ug_favorecida removido
  ptres: z.string()
    .min(1, "PTRES é obrigatório.")
    .regex(/^\d{6}$/, { message: "PTRES deve ter 6 dígitos." }),
  naturezadespesa: z.string()
     .min(1, "ND é obrigatória.")
     .regex(/^\d{6,}$/, { message: "ND deve ter no mínimo 6 dígitos." }), // Ajustado para aceitar 6 ou mais, como 33903000
  fonterecurso: z.string()
    .min(1, "Fonte é obrigatória.")
    .regex(/^\d{1,10}$/, { message: "Fonte deve ter até 10 dígitos." }), // Ajustado para até 10 dígitos
  pi: z.string().min(1, { message: "Plano Interno é obrigatório." }), // Tornou-se obrigatório
  valortotal: z.number({ required_error: "Valor é obrigatório.", invalid_type_error: "Valor inválido."})
    .positive({ message: "Valor deve ser positivo." }),
    datavalidade: z.date({ required_error: 'A data é obrigatória.' }).nullable(),
});

type FormValues = z.infer<typeof formSchema>;

type AddNcFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

export function AddNcForm({ onSuccess, onCancel }: AddNcFormProps) {
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Removido submitError, pois @mantine/form mostra erros nos campos

  // Usa @mantine/form
  const form = useForm<FormValues>({
    validate: zodResolver(formSchema),
    initialValues: {
      numeronc: '',
      datarecepcao: new Date(),
      ug_gestora: '',
      // ug_favorecida removido
      ptres: '',
      naturezadespesa: '',
      fonterecurso: '',
      pi: '', // Obrigatório, mas começa vazio
      valortotal: 0,
      datavalidade: null as Date | null, // Começa nulo, mas validação exigirá uma data
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    // O Zod já garante que datavalidade não é null aqui se a validação passou
    // Mas adicionamos uma verificação extra por segurança de tipos
    if (!values.datavalidade) {
        form.setFieldError('datavalidade', 'Data de validade é obrigatória.');
        setIsSubmitting(false);
        return;
    }

    const dataToInsert = {
      numeronc: values.numeronc,
      datarecepcao: values.datarecepcao.toISOString().split('T')[0],
      ug_gestora: values.ug_gestora,
      // ug_favorecida removido
      ptres: values.ptres,
      naturezadespesa: values.naturezadespesa,
      fonterecurso: values.fonterecurso,
      pi: values.pi, // Já é string e obrigatório
      valortotal: values.valortotal,
      datavalidade: values.datavalidade.toISOString().split('T')[0], // Converte para string
    };

    console.log("Dados para inserir:", dataToInsert);

    try {
      const { error } = await supabase.from("NotasCredito").insert([dataToInsert]);
      if (error) throw error;

      notifications.show({
        title: 'Sucesso!',
        message: 'Nota de Crédito cadastrada com sucesso.',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      form.reset(); // Limpa o formulário após sucesso
      onSuccess();

    } catch (error: any) {
      console.error("Erro ao inserir NC:", error);
      notifications.show({
          title: 'Erro ao Salvar!',
          message: `Não foi possível salvar a NC: ${error.message}`,
          color: 'red',
          icon: <IconAlertCircle size={16} />,
        });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        {/* Número NC */}
        <TextInput
          required
          label="Número da NC"
          placeholder="2025NC######"
          {...form.getInputProps('numeronc')}
        />

        {/* Data Recepção */}
        <DateInput
          required
          label="Data de Recepção"
          valueFormat="DD/MM/YYYY"
          placeholder="DD/MM/AAAA"
          {...form.getInputProps('datarecepcao')}
        />

        {/* UG Gestora */}
        <TextInput
          required
          label="UG Gestora"
          placeholder="6 dígitos numéricos"
          maxLength={6}
          {...form.getInputProps('ug_gestora')}
        />
        {/* UG Favorecida Removido */}

        {/* PTRES, ND, Fonte */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              required
              label="PTRES"
              placeholder="6 dígitos numéricos"
              maxLength={6}
              {...form.getInputProps('ptres')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              required
              label="Natureza Despesa (ND)"
              placeholder="Ex: 339030"
              maxLength={8} // Permite subelemento se necessário, mas valida 6+
              {...form.getInputProps('naturezadespesa')}
            />
          </Grid.Col>
           <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              required
              label="Fonte Recurso"
              placeholder="Até 10 dígitos numéricos"
              maxLength={10}
              {...form.getInputProps('fonterecurso')}
            />
          </Grid.Col>
        </Grid>

        {/* PI (Plano Interno) - Agora obrigatório */}
        <TextInput
          required
          label="Plano Interno (PI)"
          placeholder="Digite o Plano Interno"
          {...form.getInputProps('pi')}
        />
        
        {/* Valor Total e Data Validade */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
             <NumberInput
              required
              label="Valor Total (R$)"
              placeholder="1500.50"
              decimalScale={2}
              fixedDecimalScale
              min={0.01} // Garante positivo
              {...form.getInputProps('valortotal')}
            />
          </Grid.Col>
           <Grid.Col span={{ base: 12, md: 6 }}>
             {/* Data Validade - Agora obrigatória */}
             <DateInput
              required
              label="Data de Validade"
              valueFormat="DD/MM/YYYY"
              placeholder="DD/MM/AAAA"
              clearable={false} // Não pode ser limpo pois é obrigatório
              {...form.getInputProps('datavalidade')}
            />
          </Grid.Col>
        </Grid>

        {/* Erro geral de submit não é mais necessário aqui */}

        {/* Botões */}
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting} loaderProps={{ type: 'dots' }}>
            Salvar Nota de Crédito
          </Button>
        </Group>
      </Stack>
    </form>
  );
}