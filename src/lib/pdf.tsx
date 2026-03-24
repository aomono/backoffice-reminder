import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
} from "@react-pdf/renderer";

Font.register({
  family: "NotoSansJP",
  src: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2g.ttf",
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    fontSize: 11,
    padding: 50,
    lineHeight: 1.6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  companyName: {
    fontSize: 12,
  },
  issueDate: {
    fontSize: 10,
    color: "#666",
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "bold",
  },
  recipient: {
    fontSize: 13,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 10,
    color: "#666",
    marginBottom: 4,
    marginTop: 16,
  },
  sectionValue: {
    fontSize: 11,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  amountSection: {
    marginTop: 24,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  amountLabel: {
    fontSize: 10,
    color: "#666",
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 50,
    left: 50,
    right: 50,
    textAlign: "right",
    fontSize: 10,
    color: "#666",
  },
});

interface ReportPdfProps {
  companyName: string;
  clientName: string;
  period: string;
  workDescription: string;
  amount: number;
  issueDate: string;
}

function ReportDocument({
  companyName,
  clientName,
  period,
  workDescription,
  amount,
  issueDate,
}: ReportPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.companyName}>{companyName}</Text>
          <Text style={styles.issueDate}>発行日: {issueDate}</Text>
        </View>

        <Text style={styles.title}>業務完了報告書</Text>

        <Text style={styles.recipient}>{clientName} 御中</Text>

        <Text style={styles.sectionLabel}>対象期間</Text>
        <Text style={styles.sectionValue}>{period}</Text>

        <Text style={styles.sectionLabel}>業務内容</Text>
        <Text style={styles.sectionValue}>{workDescription}</Text>

        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>請求金額（税込）</Text>
          <Text style={styles.amountValue}>
            ¥{amount.toLocaleString()}
          </Text>
        </View>

        <Text style={styles.footer}>{companyName}</Text>
      </Page>
    </Document>
  );
}

export async function generateReportPdf(
  props: ReportPdfProps
): Promise<Buffer> {
  const buffer = await renderToBuffer(
    <ReportDocument {...props} />
  );
  return Buffer.from(buffer);
}
