/**
 * Education, as the one-line root of the career `git log`:
 * "root: NC State · BS Electrical Eng. + BS Computer Eng. · 2013".
 */
export const education = {
  school: "NC State",
  degrees: ["BS Electrical Eng.", "BS Computer Eng."],
  graduated: 2013,
};

/** The line itself, as the log prints it. */
export const educationRoot = `root: ${education.school} · ${education.degrees.join(" + ")} · ${education.graduated}`;
