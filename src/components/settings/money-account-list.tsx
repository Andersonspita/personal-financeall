"use client";

import { useActionState } from "react";
import {
  archiveAccountFromForm,
  restoreAccountFromForm,
  updateAccountFromForm,
} from "@/actions/accounts";
import { ACCOUNT_TYPES, ACCOUNT_TYPE_LABEL } from "@/lib/accounts";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { fieldControlClass } from "@/components/ui/control";
import type { FormActionState } from "@/lib/errors";

export type MoneyAccount = {
  id: string;
  name: string;
  type: string;
  initialBalance: number;
  archived: boolean;
};

const idle: FormActionState = {};

function ActiveAccountRow({
  account,
  canArchive,
}: {
  account: MoneyAccount;
  canArchive: boolean;
}) {
  const [saveState, saveAction, savePending] = useActionState(updateAccountFromForm, idle);
  const [archiveState, archiveAction, archivePending] = useActionState(archiveAccountFromForm, idle);

  return (
    <li className="flex flex-col gap-3 border-t border-border pt-4 first:border-t-0 first:pt-0">
      <form action={saveAction} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={account.id} />
        <Field label="Nome" htmlFor={`account-name-${account.id}`} error={saveState.fieldErrors?.name}>
          <input
            id={`account-name-${account.id}`}
            name="name"
            required
            maxLength={80}
            defaultValue={account.name}
            aria-invalid={Boolean(saveState.fieldErrors?.name)}
            className={fieldControlClass(Boolean(saveState.fieldErrors?.name))}
          />
        </Field>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <Field label="Tipo" htmlFor={`account-type-${account.id}`} error={saveState.fieldErrors?.type}>
            <Select
              id={`account-type-${account.id}`}
              name="type"
              required
              defaultValue={account.type}
              invalid={Boolean(saveState.fieldErrors?.type)}
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {ACCOUNT_TYPE_LABEL[type]}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Saldo inicial"
            htmlFor={`account-balance-${account.id}`}
            error={saveState.fieldErrors?.initialBalance}
          >
            <input
              id={`account-balance-${account.id}`}
              name="initialBalance"
              type="number"
              step="0.01"
              defaultValue={account.initialBalance}
              aria-invalid={Boolean(saveState.fieldErrors?.initialBalance)}
              className={fieldControlClass(Boolean(saveState.fieldErrors?.initialBalance))}
            />
          </Field>
        </div>
        {saveState.error && !saveState.fieldErrors && (
          <p className="text-sm text-critical" role="alert">
            {saveState.error}
          </p>
        )}
        {saveState.success && (
          <p className="text-sm text-primary" role="status">
            Alterações salvas.
          </p>
        )}
        <Button type="submit" variant="subtle" pending={savePending} className="self-start">
          {savePending ? "Salvando..." : "Salvar"}
        </Button>
      </form>
      {canArchive ? (
        <form action={archiveAction}>
          <input type="hidden" name="id" value={account.id} />
          {archiveState.error && (
            <p className="mb-2 text-sm text-critical" role="alert">
              {archiveState.error}
            </p>
          )}
          <Button type="submit" variant="secondary" pending={archivePending} className="text-xs">
            {archivePending ? "Arquivando..." : "Arquivar"}
          </Button>
        </form>
      ) : (
        <p className="text-xs text-foreground-muted">Esta é a única conta ativa — os lançamentos precisam dela.</p>
      )}
    </li>
  );
}

function ArchivedAccountRow({ account }: { account: MoneyAccount }) {
  const [state, formAction, isPending] = useActionState(restoreAccountFromForm, idle);

  return (
    <li className="flex flex-col gap-2 border-t border-border pt-3 first:border-t-0 first:pt-0">
      <div>
        <p className="font-medium">{account.name}</p>
        <p className="text-xs text-foreground-muted">
          {ACCOUNT_TYPE_LABEL[account.type as keyof typeof ACCOUNT_TYPE_LABEL] ?? account.type}
        </p>
      </div>
      {state.error && (
        <p className="text-sm text-critical" role="alert">
          {state.error}
        </p>
      )}
      <form action={formAction}>
        <input type="hidden" name="id" value={account.id} />
        <Button type="submit" variant="secondary" pending={isPending} className="text-xs">
          {isPending ? "Reativando..." : "Reativar"}
        </Button>
      </form>
    </li>
  );
}

export function MoneyAccountList({ accounts }: { accounts: MoneyAccount[] }) {
  const active = accounts.filter((account) => !account.archived);
  const archived = accounts.filter((account) => account.archived);
  const canArchive = active.length > 1;

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-4">
        {active.map((account) => (
          <ActiveAccountRow key={account.id} account={account} canArchive={canArchive} />
        ))}
      </ul>
      {archived.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-foreground-muted">Arquivadas</h3>
          <ul className="flex flex-col gap-3">
            {archived.map((account) => (
              <ArchivedAccountRow key={account.id} account={account} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
