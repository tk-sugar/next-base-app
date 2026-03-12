import { Octokit } from "@octokit/rest";

export function getOctokit(accessToken: string): Octokit {
  return new Octokit({
    auth: accessToken,
    userAgent: "github-ai-report/1.0",
  });
}
