const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

const BRAND_PRIMARY = "#35b9f1";
const BRAND_NAVY = "#081f2d";

export const getWelcomeEmailTemplate = (name: string): string => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to DSA Buddy!</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f8fafc;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
    }
    .header {
      background-color: ${BRAND_NAVY};
      border-bottom: 4px solid ${BRAND_PRIMARY};
      padding: 36px 32px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 36px 32px;
      color: #334155;
      line-height: 1.6;
    }
    .content h2 {
      font-size: 19px;
      color: ${BRAND_NAVY};
      margin-top: 0;
      font-weight: 700;
    }
    .features {
      margin: 24px 0;
      padding: 0;
      list-style-type: none;
    }
    .feature-item {
      margin-bottom: 16px;
      padding-left: 28px;
      position: relative;
      font-size: 14px;
    }
    .feature-icon {
      position: absolute;
      left: 0;
      top: 1px;
      color: ${BRAND_PRIMARY};
      font-weight: bold;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0 8px;
    }
    .btn {
      display: inline-block;
      background-color: ${BRAND_PRIMARY};
      color: ${BRAND_NAVY} !important;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 15px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 32px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    .footer a {
      color: #0369a1;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Welcome to DSA Buddy! 🚀</h1>
      </div>
      <div class="content">
        <h2>Hey ${name || "Coder"},</h2>
        <p>We are absolutely thrilled to welcome you to <strong>DSA Buddy</strong>—your ultimate companion for tracking progress, solving daily problems, and mastering technical interviews.</p>
        <p>Here is what you can do with DSA Buddy starting today:</p>
        <ul class="features">
          <li class="feature-item">
            <span class="feature-icon">&bull;</span>
            <strong>Unified Dashboard:</strong> Sync your profiles from LeetCode, Codeforces, and CodeChef to display all stats in a single heatmap.
          </li>
          <li class="feature-item">
            <span class="feature-icon">&bull;</span>
            <strong>Department & Global Leaderboards:</strong> Climb ranks and compete with coders in your department, college, or globally.
          </li>
          <li class="feature-item">
            <span class="feature-icon">&bull;</span>
            <strong>Problem of the Day:</strong> Receive curated challenges directly in your inbox to maintain consistency.
          </li>
        </ul>
        <div class="btn-container">
          <a href="${frontendUrl}" class="btn" target="_blank">Go to Dashboard</a>
        </div>
      </div>
      <div class="footer">
        <p>Happy Coding! <br><strong>The DSA Buddy Team</strong></p>
        <p><a href="${frontendUrl}">dsabuddy.xyz</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
};

interface PotdProblem {
  difficulty?: string | null;
  sourceUrl?: string | null;
  leetcodeUrl?: string | null;
  sourceRating?: number | string | null;
  statement?: string | null;
  acceptanceRate?: number | null;
  displayName?: string | null;
  title?: string | null;
  sourcePlatform?: string | null;
}

export const getPotdEmailTemplate = (name: string, problem: PotdProblem): string => {
  const difficulty = (problem.difficulty || "MEDIUM").toUpperCase();

  let badgeClass = "badge-medium";
  let cardBorderColor = "#e2e8f0";

  if (difficulty === "EASY") {
    badgeClass = "badge-easy";
    cardBorderColor = "#10b981";
  } else if (difficulty === "MEDIUM") {
    badgeClass = "badge-medium";
    cardBorderColor = "#f59e0b";
  } else if (difficulty === "HARD") {
    badgeClass = "badge-hard";
    cardBorderColor = "#ef4444";
  }

  const solveUrl = problem.sourceUrl || problem.leetcodeUrl || `${frontendUrl}/problems`;

  const ratingBadgeHtml = problem.sourceRating
    ? `<span class="badge badge-rating">Rating: ${problem.sourceRating}</span>`
    : "";

  let problemStatementHtml = "";
  if (problem.statement) {
    const cleanStatement = problem.statement.replace(/<[^>]*>/g, "");
    const truncated =
      cleanStatement.length > 280 ? cleanStatement.substring(0, 280) + "..." : cleanStatement;
    problemStatementHtml = `<p class="problem-desc"><strong>Problem Description:</strong><br>${truncated}</p>`;
  } else if (problem.acceptanceRate) {
    problemStatementHtml = `<p class="problem-desc"><strong>Acceptance Rate:</strong> ${(problem.acceptanceRate * 100).toFixed(1)}%</p>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily DSA Challenge</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f8fafc;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
    }
    .header {
      background-color: ${BRAND_NAVY};
      border-bottom: 4px solid ${BRAND_PRIMARY};
      padding: 28px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 36px 32px;
      color: #334155;
      line-height: 1.6;
    }
    .content h2 {
      font-size: 19px;
      color: ${BRAND_NAVY};
      margin-top: 0;
      font-weight: 700;
    }
    .problem-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid ${cardBorderColor};
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
    }
    .problem-title {
      font-size: 17px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 12px 0;
    }
    .meta-badges {
      margin-bottom: 12px;
    }
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      margin-right: 6px;
    }
    .badge-easy {
      background-color: #d1fae5;
      color: #065f46;
    }
    .badge-medium {
      background-color: #fef3c7;
      color: #92400e;
    }
    .badge-hard {
      background-color: #fee2e2;
      color: #991b1b;
    }
    .badge-platform {
      background-color: #e0f2fe;
      color: #0369a1;
    }
    .badge-rating {
      background-color: #f3e8ff;
      color: #6b21a8;
    }
    .problem-desc {
      font-size: 13px;
      color: #475569;
      margin-top: 12px;
      margin-bottom: 0;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0 8px;
    }
    .btn {
      display: inline-block;
      background-color: ${BRAND_PRIMARY};
      color: ${BRAND_NAVY} !important;
      text-decoration: none;
      padding: 11px 24px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 14px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 32px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    .footer a {
      color: #0369a1;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Daily DSA Challenge 🎯</h1>
      </div>
      <div class="content">
        <h2>Hey ${name || "Coder"},</h2>
        <p>Keep your daily streak alive! Here is today's handpicked problem for you to solve:</p>

        <div class="problem-card">
          <h3 class="problem-title">${problem.displayName || problem.title}</h3>
          <div class="meta-badges">
            <span class="badge ${badgeClass}">${difficulty}</span>
            <span class="badge badge-platform">${problem.sourcePlatform || "DSA BUDDY"}</span>
            ${ratingBadgeHtml}
          </div>
          ${problemStatementHtml}
        </div>

        <div class="btn-container">
          <a href="${solveUrl}" class="btn" target="_blank">Solve Challenge</a>
        </div>
      </div>
      <div class="footer">
        <p>Keep grinding, consistency beats talent! <br><strong>The DSA Buddy Team</strong></p>
        <p><a href="${frontendUrl}">dsabuddy.xyz</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
};
