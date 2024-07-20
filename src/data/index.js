import {
  ham,
  telegram,
  musiqi,
} from "../assets";

export const navLinks = [
  {
    id: "hero",
    title: "Home",
  },
  {
    id: "portfolio",
    title: "Projects",
  },
  {
    id: "experience",
    title: "Experience",
  },
  {
    id:"contact",
    title: "Contact Me",
  },
];

const experiences = [
  {
    title: "Part-time Intern",
    company_name: "Visteon Corporation",
    date: "Nov 2021 - Mar 2022",
    details: [
      "Automated image annotations and facial landmark detection, achieving significant efficiency gains.",
      "Improved accuracy and robustness of computer vision applications, enhancing driver-assistance technologies..",
      "Researched relevant literature, initiated the design of the photometric alignment algorithm for the surround-view system, and made pivotal contributions. These efforts advanced technological capabilities, solidifying the company's reputation.",
    ],
  },
  {
    title: "Full-time Intern",
    company_name: "Visteon Corporation",
    date: "Sept 2021 - Nov 2021",
    details: [
      "Integrated reverse camera features into the Android OS, elevating user satisfaction and market competitiveness.",
      "Received positive user feedback, contributing to increased customer satisfaction and positioning the company as a leader in in-car entertainment and safety experiences.",
      "Collaborated seamlessly across teams, ensuring optimal performance through rigorous testing and debugging.",
    ],
  },
];

const portfolio = [
  {
    name: "Musiqi",
    description:
      "An online web music player application that seamlessly fetches and streams music using the Shazam API, providing users with an extensive and up-to-date music library.",
    image: musiqi,
  },
  {
    name: "Fake News Detection",
    description:
      "One-of-a-kind fake news detection system for India. The implementation consists of one of the first true news dataset specific to India.",
    image: telegram,
  },
  {
    name: "Skin Cancer Detection",
    description:
      "Led a team of four in development of a skin cancer classifier and developing a mobile app for the same.",
    image: ham,
  },
];

export { experiences, portfolio };

