import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  Text,
  Heading,
  Strong,
  Stack,
  Inline,
  Box,
  Button,
  Lozenge,
  SectionMessage,
  Spinner,
  Link,
} from '@forge/react';
import { invoke } from '@forge/bridge';

const confidenceAppearance = (score) =>
  score >= 67 ? 'removed' : score >= 34 ? 'moved' : 'success';
//  high risk = red(removed), medium = yellow(moved), low = green(success)

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createdMsg, setCreatedMsg] = useState(null);

  useEffect(() => {
    invoke('runHindsight')
      .then(setData)
      .catch((e) => setData({ ok: false, error: String(e) }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Inline alignBlock="center" space="space.100">
        <Spinner size="medium" />
        <Text>Running Hindsight — reading past incidents…</Text>
      </Inline>
    );
  }

  if (!data?.ok) {
    return (
      <SectionMessage title="Hindsight couldn't run" appearance="warning">
        <Text>{data?.error || 'Unknown error.'}</Text>
      </SectionMessage>
    );
  }

  const { issue, confidence, prediction, pastIncidents, runbook, usedDemoData } = data;
  const staleRunbooks = (runbook?.pages || []).filter((p) => p.stale);

  const createSubtasks = async () => {
    setCreating(true);
    try {
      const res = await invoke('createMitigations', { steps: prediction.mitigations });
      setCreatedMsg(
        res?.ok
          ? `Created ${res.created.length} subtask(s): ${res.created.join(', ')}`
          : res?.error || 'Could not create subtasks.'
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <Stack space="space.200">
      {/* Confidence header */}
      <Inline alignBlock="center" space="space.100" spread="space-between">
        <Heading as="h3">Predicted post-mortem</Heading>
        <Lozenge appearance={confidenceAppearance(confidence.score)} isBold>
          {confidence.score}% confidence
        </Lozenge>
      </Inline>

      {usedDemoData && (
        <SectionMessage appearance="information">
          <Text>
            No real incident history on these components yet — showing a
            prediction from bundled <Strong>demo incidents</Strong>.
          </Text>
        </SectionMessage>
      )}

      {/* The prediction */}
      <Box>
        <Text>
          <Strong>{prediction.headline}</Strong>
        </Text>
        <Text>{prediction.body}</Text>
      </Box>

      {/* Confidence breakdown (transparent, not a black box) */}
      <Box>
        <Text><Strong>Why this score</Strong></Text>
        <Stack space="space.050">
          {confidence.factors.map((f) => (
            <Text key={f.label}>
              • {f.label}: {f.value}% — {f.detail}{' '}
              <Lozenge>{Math.round(f.weight * 100)}% weight</Lozenge>
            </Text>
          ))}
        </Stack>
      </Box>

      {/* Evidence: the past incidents it learned from */}
      {pastIncidents.length > 0 && (
        <Box>
          <Text><Strong>Learned from</Strong></Text>
          <Stack space="space.050">
            {pastIncidents.slice(0, 5).map((inc) => (
              <Text key={inc.key}>
                • {inc.key}: {inc.summary}
                {inc.demo ? ' (demo)' : ''}
              </Text>
            ))}
          </Stack>
        </Box>
      )}

      {/* Stale runbook warning */}
      {staleRunbooks.length > 0 && (
        <SectionMessage title="Stale runbooks" appearance="warning">
          {staleRunbooks.map((p) => (
            <Text key={p.title}>
              {p.url ? <Link href={p.url}>{p.title}</Link> : p.title} — {p.ageDays} days old
            </Text>
          ))}
        </SectionMessage>
      )}

      {/* Mitigations + one-click action */}
      <Box>
        <Text><Strong>Recommended mitigations</Strong></Text>
        <Stack space="space.050">
          {prediction.mitigations.map((m, i) => (
            <Text key={i}>• {m}</Text>
          ))}
        </Stack>
      </Box>

      <Inline space="space.100" alignBlock="center">
        <Button
          appearance="primary"
          onClick={createSubtasks}
          isDisabled={creating}
        >
          {creating ? 'Creating…' : 'Create mitigation subtasks'}
        </Button>
        {createdMsg && <Text>{createdMsg}</Text>}
      </Inline>
    </Stack>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
