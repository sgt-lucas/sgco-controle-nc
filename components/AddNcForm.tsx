// Caminho: components/AddNcForm.tsx (Versão Mantine UI)
'use client';

import { useForm, zodResolver } from '@mantine/form';
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
import { z } from 'zod';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';

// Schema de validação Zod (compatível com Mantine Form)
// Nota: Usamos 'string' para valortotal e 'date' para datas
const formSchema = z.object({
  numeronc: z.string().min(5, { message: "Número da NC é obrigatório." }),
  datarecepcao: z.date({ required_error: "Data de recepção é obrigatória." }),
  ug_gestora: z.string().length(6, { message: "UG Gestora deve ter 6 dígitos." }),
  ug_favorecida: z.string().length(6, { message: "UG Favorecida deve ter 6 dígitos." }),
  ptres: z.string().min(1, { message: "PTRES é obrigatório." }),
  naturezadespesa: z.string().min(6, { message: "ND é obrigatória." }),
  fonterecurso: z.string().min(1, { message: "Fonte é obrigatória." }),
  pi: z.string().optional(),
  // valortotal será tratado como número pelo NumberInput
  valortotal: z.number().positive({ message: "Valor deve ser positivo." }),
  datavalidade: z.date().nullable().optional(), // Permite data ou nulo
});

type FormValues = z.infer<typeof formSchema>;

type AddNcFormProps = {
  onSuccess: () => void; // Função para fechar o modal e atualizar a tabela
  onCancel: () => void;
};

export function AddNcForm({ onSuccess, onCancel }: AddNcFormProps) {
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 1. Configuração do @mantine/form
  const form = useForm<FormValues>({
    validate: zodResolver(formSchema),
    initialValues: {
      numeronc: '',
      datarecepcao: new Date(), // Padrão para hoje
      ug_gestora: '',
      ug_favorecida: '',
      ptres: '',
      naturezadespesa: '',
      fonterecurso: '',
      pi: '',
      valortotal: 0,
      datavalidade: null,
    },
  });

  // 2. Função de submit
  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const dataToInsert = {
      numeronc: values.numeronc,
      // Formata a data para string YYYY-MM-DD (compatível com PostgreSQL)
      datarecepcao: values.datarecepcao.toISOString().split('T')[0],
      ug_gestora: values.ug_gestora,
      ug_favorecida: values.ug_favorecida,
      ptres: values.ptres,
      naturezadespesa: values.naturezadespesa,
      fonterecurso: values.fonterecurso,
      pi: values.pi || null,
      valortotal: values.valortotal, // Já é um número
      datavalidade: values.datavalidade?.toISOString().split('T')[0] || null,
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
      onSuccess(); // Fecha o modal e atualiza a tabela

    } catch (error: any) {
      console.error("Erro ao inserir NC:", error);
      setSubmitError(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Usa form nativo com onSubmit do Mantine
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        {/* Usamos Grid para layout responsivo */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <TextInput
              required
              label="Número da NC"
              placeholder="Ex: 2024NC001234"
              {...form.getInputProps('numeronc')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <DateInput
              required
              label="Data de Recepção"
              valueFormat="DD/MM/YYYY"
              placeholder="DD/MM/AAAA"
              {...form.getInputProps('datarecepcao')}
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              required
              label="UG Gestora"
              placeholder="6 dígitos"
              maxLength={6}
              {...form.getInputProps('ug_gestora')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              required
              label="UG Favorecida"
              placeholder="6 dígitos"
              maxLength={6}
              {...form.getInputProps('ug_favorecida')}
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              required
              label="PTRES"
              placeholder="Ex: 001001"
              {...form.getInputProps('ptres')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              required
              label="Natureza Despesa (ND)"
              placeholder="Ex: 33903000"
              {...form.getInputProps('naturezadespesa')}
            />
          </Grid.Col>
           <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              required
              label="Fonte Recurso"
              placeholder="Ex: 0100"
              {...form.getInputProps('fonterecurso')}
            />
          </Grid.Col>
        </Grid>

        <TextInput
          label="Plano Interno (PI)"
          placeholder="Opcional"
          {...form.getInputProps('pi')}
        />
        
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
             <NumberInput
              required
              label="Valor Total (R$)"
              placeholder="1500.50"
              decimalScale={2}
              fixedDecimalScale
              min={0.01}
              {...form.getInputProps('valortotal')}
            />
          </Grid.Col>
           <Grid.Col span={{ base: 12, md: 6 }}>
             <DateInput
              label="Data de Validade (Opcional)"
              valueFormat="DD/MM/YYYY"
              placeholder="DD/MM/AAAA"
              clearable // Permite limpar o campo
              {...form.getInputProps('datavalidade')}
            />
          </Grid.Col>
        </Grid>

        {submitError && (
          <Alert color="red" title="Erro ao Salvar" icon={<IconAlertCircle size={16} />} withCloseButton onClose={() => setSubmitError(null)}>
            {submitError}
          </Alert>
        )}

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