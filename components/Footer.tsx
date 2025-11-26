import { GitHubIcon, LinkedInIcon } from "@/components/icons/SocialIcons";

const socialLinks = [
  {
    href: "https://github.com/jwh3times",
    label: "GitHub",
    icon: GitHubIcon,
  },
  {
    href: "https://www.linkedin.com/in/jerryhollandiii",
    label: "LinkedIn",
    icon: LinkedInIcon,
  },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4">
          {/* Social Links */}
          <div className="flex gap-6">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label={social.label}
              >
                <social.icon className="w-6 h-6" />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-muted">
            &copy; {new Date().getFullYear()} Holland. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
