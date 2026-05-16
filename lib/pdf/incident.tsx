import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Link,
} from "@react-pdf/renderer";
import type { IncidentPacket, IncidentType, ProtectionRecord } from "@/types";

const styles = StyleSheet.create({
  page: { padding: 56, fontFamily: "Helvetica", fontSize: 11, color: "#1D1D1F" },
  h1: { fontSize: 22, fontWeight: 600, marginBottom: 4 },
  h2: { fontSize: 14, fontWeight: 600, marginTop: 18, marginBottom: 6 },
  meta: { fontSize: 9, color: "#6E6E73" },
  para: { lineHeight: 1.5, marginBottom: 6 },
  tableRow: { flexDirection: "row", borderBottom: "1pt solid #EAEAEA", paddingVertical: 4 },
  tableHead: { flexDirection: "row", borderBottom: "1pt solid #1D1D1F", paddingVertical: 4 },
  cell: { flex: 1, paddingRight: 6 },
  cellHead: { flex: 1, paddingRight: 6, fontWeight: 600, fontSize: 10 },
  expired: { fontSize: 9, color: "#B42318", marginTop: 2 },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 56,
    right: 56,
    fontSize: 9,
    color: "#6E6E73",
    borderTop: "1pt solid #EAEAEA",
    paddingTop: 8,
  },
});

const INCIDENT_LABELS: Record<IncidentType, string> = {
  violence: "Violence or threat to safety",
  education: "Education (Title IX)",
  housing: "Housing",
  employment: "Employment",
  healthcare: "Healthcare",
  public_accommodation: "Public accommodation",
  other: "Other",
};

type NextStep = {
  name: string;
  url: string;
  note: string;
  // If set, the note carries a statutory deadline counted in days from the
  // incident date. The PDF will compute the absolute date and flag if it has
  // already passed, so users don't get told "file within 180 days" 18 months
  // after the fact.
  deadline_days?: number;
};

const NEXT_STEPS: Record<IncidentType, NextStep[]> = {
  violence: [
    {
      name: "Call 911 or local police",
      url: "https://www.usa.gov/local-governments",
      note:
        "If you haven't already, file a police report. For an emergency or ongoing threat, call 911. Ask for the report number — you'll need it for medical, civil, and insurance claims.",
    },
    {
      name: "Seek medical care and preserve records",
      url: "https://www.rainn.org/articles/preserving-and-collecting-forensic-evidence",
      note:
        "Get evaluated even if you feel okay — concussions and internal injuries can present late. Keep every discharge summary, imaging report, and bill; photograph visible injuries with a timestamp.",
    },
    {
      name: "Victim advocate (free, confidential)",
      url: "https://victimconnect.org/",
      note:
        "VictimConnect (1-855-484-2846) helps with reporting, victim compensation funds, protective orders, and finding local advocates.",
    },
    {
      name: "Consult a personal-injury or civil-rights attorney",
      url: "https://www.lambdalegal.org/help",
      note:
        "Civil claims (battery, intentional infliction of emotional distress) can run alongside any criminal case. State civil statutes of limitations are typically 1–3 years — don't wait.",
    },
  ],
  education: [
    {
      name: "School's Title IX Coordinator",
      url: "https://www2.ed.gov/about/offices/list/ocr/complaints-how.html",
      note:
        "Every federally funded school must have a Title IX coordinator. Submit a written complaint to start a formal investigation; the school must respond.",
    },
    {
      name: "U.S. Department of Education — Office for Civil Rights",
      url: "https://www2.ed.gov/about/offices/list/ocr/complaintintro.html",
      note:
        "File a Title IX complaint with OCR within 180 days of the incident.",
      deadline_days: 180,
    },
  ],
  employment: [
    {
      name: "EEOC",
      url: "https://www.eeoc.gov/filing-charge-discrimination",
      note:
        "File a charge of discrimination within 180 days of the incident (300 days in some states with parallel agencies).",
      deadline_days: 180,
    },
  ],
  housing: [
    {
      name: "HUD Fair Housing",
      url: "https://www.hud.gov/program_offices/fair_housing_equal_opp/online-complaint",
      note: "File a fair housing complaint within one year of the incident.",
      deadline_days: 365,
    },
  ],
  healthcare: [
    {
      name: "HHS Office for Civil Rights",
      url: "https://www.hhs.gov/civil-rights/filing-a-complaint/index.html",
      note: "File a Section 1557 complaint within 180 days of the incident.",
      deadline_days: 180,
    },
  ],
  public_accommodation: [
    {
      name: "DOJ Civil Rights Division",
      url: "https://civilrights.justice.gov/",
      note: "Report a public accommodation incident.",
    },
  ],
  other: [
    {
      name: "Lambda Legal Help Desk",
      url: "https://www.lambdalegal.org/help",
      note: "Free intake to determine the right filing venue.",
    },
  ],
};

export function IncidentPDF({ packet }: { packet: IncidentPacket }) {
  const today = new Date().toISOString().slice(0, 10);
  const type: IncidentType = packet.incident_type || "other";
  const nextSteps = NEXT_STEPS[type] || NEXT_STEPS.other;
  const protections = packet.applicable_protections || [];

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.h1}>Incident documentation packet</Text>
        <Text style={styles.meta}>
          Generated by Seagull on {today} ·{" "}
          {packet.incident_type ? INCIDENT_LABELS[type] : "Uncategorized"}
        </Text>

        <Text style={styles.h2}>Summary</Text>
        <Text style={styles.para}>
          {packet.summary || "Not yet generated."}
        </Text>

        <Text style={styles.h2}>Timeline of events</Text>
        <Text style={styles.para}>
          {packet.incident_date
            ? `${packet.incident_date}${
                packet.incident_location_city || packet.incident_location_state
                  ? " — " +
                    [packet.incident_location_city, packet.incident_location_state]
                      .filter(Boolean)
                      .join(", ")
                  : ""
              }`
            : "Date not captured."}
          {"\n\n"}
          {packet.what_happened || "No narrative captured."}
        </Text>

        <Text style={styles.h2}>Parties involved</Text>
        <Table
          headers={["Name", "Role"]}
          rows={(packet.parties_involved || []).map((p) => [p.name, p.role])}
        />

        <Text style={styles.h2}>Witnesses</Text>
        <Table
          headers={["Name", "Contact", "What they saw"]}
          rows={(packet.witnesses || []).map((w) => [
            w.name,
            w.contact || "—",
            w.what_they_saw,
          ])}
        />

        <Text style={styles.h2}>Evidence inventory</Text>
        <Table
          headers={["Type", "Description", "Location"]}
          rows={(packet.evidence || []).map((e) => [e.type, e.description, e.location])}
        />

        <Text style={styles.h2}>Applicable legal protections</Text>
        {protections.length === 0 ? (
          <Text style={styles.para}>
            {type === "violence"
              ? "Criminal incidents (assault, battery, threats, hate crimes) are documented for police and prosecutor use rather than under a single civil rights statute. See Suggested next steps below for filing pathways. Civil claims (battery, intentional infliction of emotional distress) may also apply — consult a personal-injury or civil-rights attorney."
              : "None looked up yet."}
          </Text>
        ) : (
          (protections as ProtectionRecord[]).map((p, i) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <Text style={{ fontWeight: 600 }}>{p.title}</Text>
              <Text style={styles.meta}>{p.citation}</Text>
              <Text style={styles.para}>{p.summary}</Text>
              {p.url && <Link src={p.url}>{p.url}</Link>}
            </View>
          ))
        )}

        <Text style={styles.h2}>Suggested next steps</Text>
        {nextSteps.map((step, i) => {
          const deadline = computeDeadline(step.deadline_days, packet.incident_date, today);
          return (
            <View key={i} style={{ marginBottom: 6 }}>
              <Text style={{ fontWeight: 600 }}>{step.name}</Text>
              <Text style={styles.para}>{step.note}</Text>
              {deadline && (
                <Text style={deadline.expired ? styles.expired : styles.meta}>
                  {deadline.expired
                    ? `Deadline ${deadline.date} (${step.deadline_days} days from ${packet.incident_date}) has passed — a lawyer can advise on remaining options.`
                    : `Deadline: ${deadline.date} (${step.deadline_days} days from ${packet.incident_date}).`}
                </Text>
              )}
              <Link src={step.url}>{step.url}</Link>
            </View>
          );
        })}

        <Text style={styles.footer}>
          Generated by Seagull on {today}. This is documentation, not legal advice.
        </Text>
      </Page>
    </Document>
  );
}

function computeDeadline(
  deadlineDays: number | undefined,
  incidentDate: string | undefined,
  today: string
): { date: string; expired: boolean } | null {
  if (!deadlineDays || !incidentDate) return null;
  const t = Date.parse(incidentDate);
  if (Number.isNaN(t)) return null;
  const d = new Date(t);
  d.setUTCDate(d.getUTCDate() + deadlineDays);
  const date = d.toISOString().slice(0, 10);
  return { date, expired: date < today };
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  if (rows.length === 0) {
    return <Text style={styles.para}>Not yet captured.</Text>;
  }
  return (
    <View>
      <View style={styles.tableHead}>
        {headers.map((h) => (
          <Text key={h} style={styles.cellHead}>
            {h}
          </Text>
        ))}
      </View>
      {rows.map((row, ri) => (
        <View style={styles.tableRow} key={ri}>
          {row.map((cell, ci) => (
            <Text key={ci} style={styles.cell}>
              {cell || "—"}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}
