
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Link as MuiLink,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowBackRounded,
  ArrowForwardRounded,
  AutoAwesomeRounded,
  GavelRounded,
  InfoOutlined,
  PrivacyTipOutlined,
  ContactSupportOutlined,
  ReportProblemOutlined,
  CookieOutlined,
  MailOutlineRounded,
  ShieldOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";

const MotionBox = motion(Box);

const content = {
  about: {
    title: "About urlink",
    subtitle: "Discover useful resources. Find your next favourite tool.",
    icon: <InfoOutlined />,
    updated: "October 2026",
    sections: [
      {
        title: "What is urlink?",
        body: "urlink is a resource discovery directory designed to help people explore useful websites, online tools, AI resources, open-source projects and career opportunities in one place.",
      },
      {
        title: "Our mission",
        body: "Our goal is to make discovering useful online resources simpler and more convenient through organised categories and accessible listings.",
      },
      {
        title: "Third-party resources",
        body: "Some listings direct users to websites operated by third parties. Those websites have their own terms, privacy policies and practices. Please review them before using their services.",
      },
      {
        title: "Corrections and suggestions",
        body: "If you find an inaccurate listing or would like to suggest an improvement, contact the urlink team through our contact page.",
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    subtitle: "The rules for accessing and using urlink.",
    icon: <GavelRounded />,
    updated: "October 2026",
    sections: [
      {
        title: "1. Acceptance of terms",
        body: "By accessing or using urlink, you agree to these Terms & Conditions. If you do not agree, please discontinue using the website.",
      },
      {
        title: "2. Eligibility and accounts",
        body: "You must provide accurate information when using account features and keep your sign-in credentials secure. You are responsible for activity carried out through your account, subject to applicable law.",
      },
      {
        title: "3. Acceptable use",
        body: "You must not misuse the website, attempt unauthorised access, interfere with its operation, distribute malicious code, submit unlawful content or use urlink to violate another person's rights.",
      },
      {
        title: "4. Third-party links",
        body: "urlink lists links to external websites and online services. We do not own or control those services and cannot guarantee their accuracy, availability, security, legality or quality. Visiting external websites is your decision.",
      },
      {
        title: "5. Intellectual property",
        body: "The urlink website design, branding and original content are protected by applicable intellectual property laws. Third-party names, logos and materials belong to their respective owners. Listings do not imply endorsement or affiliation.",
      },
      {
        title: "6. Accuracy and availability",
        body: "We aim to maintain useful listings but do not guarantee that every resource is accurate, current, uninterrupted or available. Resources may change or become unavailable without notice.",
      },
      {
        title: "7. Disclaimer",
        body: "To the extent permitted by applicable law, urlink is provided on an as-available basis. Information and listings are provided for general informational and discovery purposes and are not professional advice.",
      },
      {
        title: "8. Limitation of liability",
        body: "To the extent permitted by applicable law, urlink is not liable for losses arising from third-party websites, user reliance on listings, service interruptions or unauthorised activity beyond our reasonable control. Nothing in these terms excludes liability that cannot legally be excluded.",
      },
      {
        title: "9. Suspension or termination",
        body: "We may restrict or suspend access where reasonably necessary to protect the website, its users or comply with law. Any action will be subject to applicable legal requirements.",
      },
      {
        title: "10. Changes to these terms",
        body: "We may update these terms as the website or applicable requirements change. The revised version will be published on this page with an updated date where appropriate.",
      },
      {
        title: "11. Governing law",
        body: "These terms are subject to applicable laws of India. Any jurisdiction or dispute-resolution provision will operate subject to applicable law.",
      },
      {
        title: "12. Contact",
        body: "For questions about these terms, please use our contact page.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    subtitle: "How urlink handles personal information.",
    icon: <PrivacyTipOutlined />,
    updated: "October 2026",
    sections: [
      {
        title: "1. Information we may process",
        body: "Depending on the features you use, urlink may process your email address, account identifier, profile name or picture, information you submit, resource reports, and technical information necessary to operate and secure the website.",
      },
      {
        title: "2. Sign-in services",
        body: "Google sign-in is provided through Firebase Authentication. Email OTP sign-in may involve your email address and verification information. Authentication providers and our server process information as necessary to authenticate your account and protect access.",
      },
      {
        title: "3. How information is used",
        body: "Information may be used to provide account access, operate and maintain urlink, respond to enquiries and reports, protect against misuse, troubleshoot errors, and meet applicable legal obligations.",
      },
      {
        title: "4. Cookies and technical data",
        body: "The website and its service providers may use essential storage or similar technologies to support authentication, security and website functionality. Any additional analytics or advertising technologies should be disclosed here if they are enabled.",
      },
      {
        title: "5. Sharing and service providers",
        body: "Information may be processed by service providers that support hosting, authentication, security or website operations, and may be disclosed where required or permitted by law. We do not promise that no data is ever shared; the actual practices depend on the services used.",
      },
      {
        title: "6. External websites",
        body: "When you follow a resource link, the destination website may collect information under its own policies. urlink does not control the privacy practices of external websites.",
      },
      {
        title: "7. Retention and security",
        body: "Information should be retained only for as long as reasonably necessary for the stated purposes or as required by law. We use appropriate safeguards, but no internet transmission or storage method can be guaranteed to be completely secure.",
      },
      {
        title: "8. Your choices and rights",
        body: "Depending on applicable law, you may have rights to access information, request correction or erasure, withdraw consent where processing relies on consent, and raise a grievance. Requests may be subject to identity verification and legal exceptions.",
      },
      {
        title: "9. Children",
        body: "If urlink is made available to children, applicable Indian requirements concerning children's personal data, including any relevant consent and restrictions, must be followed. Contact us if you believe a child's information has been submitted improperly.",
      },
      {
        title: "10. Policy changes",
        body: "We may update this policy when our services, data practices or legal obligations change. Material changes should be communicated where required by applicable law.",
      },
      {
        title: "11. Contact and grievances",
        body: "For privacy questions, requests or grievances, please contact the urlink team using the contact page. The operator should add its verified contact details and any required grievance contact information before publishing this policy.",
      },
    ],
  },
  disclaimer: {
    title: "Disclaimer",
    subtitle: "Understand the scope and limitations of our directory.",
    icon: <ShieldOutlined />,
    updated: "October 2026",
    sections: [
      {
        title: "Informational purpose",
        body: "urlink provides listings to help users discover online resources. Listings are not professional, financial, medical, legal or other specialised advice.",
      },
      {
        title: "No automatic endorsement",
        body: "Listing a website, service or product does not mean urlink endorses, verifies or guarantees it.",
      },
      {
        title: "External content",
        body: "External websites may change their content, policies, pricing, availability or security practices at any time. Evaluate each service independently before relying on it.",
      },
      {
        title: "Report a concern",
        body: "If you find a broken, misleading, unsafe or potentially unlawful listing, contact us through the resource reporting page.",
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    subtitle: "Information about cookies and similar technologies.",
    icon: <CookieOutlined />,
    updated: "October 2026",
    sections: [
      {
        title: "What are cookies?",
        body: "Cookies are small files stored by a website in your browser. Similar technologies may store preferences or help maintain secure sessions.",
      },
      {
        title: "Essential functionality",
        body: "urlink or its authentication and hosting providers may use essential storage or similar technologies to support sign-in, security and core website functionality.",
      },
      {
        title: "Analytics and advertising",
        body: "If analytics, advertising or other non-essential tracking technologies are enabled, this policy should identify the actual services, explain their purposes and describe the choices available to users.",
      },
      {
        title: "Managing preferences",
        body: "You can manage cookies through your browser settings. Blocking essential technologies may affect sign-in or other website features. Browser controls may not remove all types of local storage.",
      },
      {
        title: "Updates",
        body: "This policy should be updated whenever the website's actual cookie or tracking practices change.",
      },
    ],
  },
  contact: {
    title: "Contact urlink",
    subtitle: "Questions, feedback or concerns? Send us a message.",
    icon: <ContactSupportOutlined />,
    updated: "We aim to respond as soon as reasonably possible.",
    sections: [],
  },
  "report-resource": {
    title: "Report a Resource",
    subtitle: "Help us identify broken, misleading or inappropriate links.",
    icon: <ReportProblemOutlined />,
    updated: "Reports are reviewed subject to available information and resources.",
    sections: [],
  },
};

export default function LegalPage({ page = "about" }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const data = content[page] || content.about;
  const isContact = page === "contact" || page === "report-resource";

  const handleSubmit = (event) => {
    event.preventDefault();

    const subject =
      page === "report-resource"
        ? "urlink Resource Report"
        : "Contact urlink";

    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      "",
      form.message,
    ].join("\n");

    const mailto = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setSubmitted(true);
  };

  return (
    <Box
      sx={{
        minHeight: "65vh",
        py: { xs: 4, sm: 6, md: 8 },
        background:
          "radial-gradient(circle at 5% 0%,rgba(128,82,214,.08),transparent 30%),#FCFCFF",
      }}
    >
      <Container maxWidth="md">
        <MotionBox
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Button
            component={RouterLink}
            to="/"
            startIcon={<ArrowBackRounded />}
            sx={{
              mb: 3,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Back to home
          </Button>

          <Paper
            elevation={0}
            sx={{
              overflow: "hidden",
              border: "1px solid #EEEAF5",
              borderRadius: { xs: 3, sm: 4 },
              bgcolor: "#FFFFFF",
            }}
          >
            <Box
              sx={{
                height: 5,
                background:
                  "linear-gradient(90deg,#8052D6,#B36BEA,#38C7DB)",
              }}
            />

            <Box sx={{ p: { xs: 2.5, sm: 4, md: 5 } }}>
              <Chip
                icon={data.icon}
                label="urlink information"
                size="small"
                sx={{
                  mb: 2,
                  bgcolor: "#F4EFFD",
                  color: "#8052D6",
                  fontWeight: 700,
                  "& .MuiChip-icon": { color: "inherit" },
                }}
              />

              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: 27, sm: 35 },
                  fontWeight: 850,
                  letterSpacing: "-0.8px",
                  color: "#241A38",
                  lineHeight: 1.2,
                }}
              >
                {data.title}
              </Typography>

              <Typography
                sx={{
                  mt: 1.2,
                  color: "#898397",
                  fontSize: 14,
                  lineHeight: 1.8,
                }}
              >
                {data.subtitle}
              </Typography>

              <Typography
                sx={{ mt: 1.2, color: "#A09AAF", fontSize: 11.5 }}
              >
                {page === "terms" ||
                page === "privacy" ||
                page === "disclaimer" ||
                page === "cookies"
                  ? `Last updated: ${data.updated}`
                  : data.updated}
              </Typography>

              <Divider sx={{ my: 3, borderColor: "#F0ECF6" }} />

              {isContact ? (
                <Box component="form" onSubmit={handleSubmit}>
                  <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
                    This form opens your email application. Add a verified
                    support email address to urlink before publishing.
                  </Alert>

                  {submitted && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      Your email application should open if one is configured.
                      Please send the prepared message to complete your report.
                    </Alert>
                  )}

                  <Stack spacing={2.2}>
                    <TextField
                      label="Your name"
                      value={form.name}
                      onChange={(event) =>
                        setForm({ ...form, name: event.target.value })
                      }
                      required
                      fullWidth
                    />

                    <TextField
                      label="Your email"
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm({ ...form, email: event.target.value })
                      }
                      required
                      fullWidth
                    />

                    <TextField
                      label={
                        page === "report-resource"
                          ? "Resource URL and details of the issue"
                          : "How can we help?"
                      }
                      value={form.message}
                      onChange={(event) =>
                        setForm({ ...form, message: event.target.value })
                      }
                      required
                      fullWidth
                      multiline
                      minRows={5}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      endIcon={<ArrowForwardRounded />}
                      sx={{
                        minHeight: 47,
                        borderRadius: 2.5,
                        textTransform: "none",
                        fontWeight: 750,
                        boxShadow: "none",
                        background:
                          "linear-gradient(100deg,#8052D6,#6D65E8)",
                        "&:hover": { boxShadow: "none", opacity: 0.92 },
                      }}
                    >
                      {page === "report-resource"
                        ? "Prepare resource report"
                        : "Prepare email"}
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Stack spacing={3}>
                  {data.sections.map((section, index) => (
                    <MotionBox
                      key={section.title}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.15 }}
                      transition={{ duration: 0.25, delay: index * 0.025 }}
                    >
                      <Typography
                        component="h2"
                        sx={{
                          mb: 1,
                          fontSize: { xs: 15.5, sm: 17 },
                          fontWeight: 800,
                          color: "#302543",
                        }}
                      >
                        {section.title}
                      </Typography>

                      <Typography
                        sx={{
                          color: "#777187",
                          fontSize: { xs: 13, sm: 14 },
                          lineHeight: 1.95,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {section.body}
                      </Typography>
                    </MotionBox>
                  ))}

                  {(page === "terms" || page === "privacy") && (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      This is a draft policy template. Confirm your actual
                      business details, data practices, support contacts and
                      applicable legal obligations before publishing.
                    </Alert>
                  )}
                </Stack>
              )}

              <Divider sx={{ my: 3, borderColor: "#F0ECF6" }} />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                spacing={1.5}
              >
                <Typography sx={{ fontSize: 12, color: "#898397" }}>
                  Need to explore more?
                </Typography>

                <Button
                  component={RouterLink}
                  to="/"
                  endIcon={<ArrowForwardRounded />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 750,
                    fontSize: 12.5,
                  }}
                >
                  Explore urlink
                </Button>
              </Stack>
            </Box>
          </Paper>
        </MotionBox>
      </Container>
    </Box>
  );
}
