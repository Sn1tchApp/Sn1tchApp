"use client";

import { Card } from "flowbite-react";
import { useEffect, useState } from "react";
import DognutContributions from "./DognutContributions";
import BarchartContributions from "./BarchartContributions";

interface Author {
  email: string;
  name: string;
  timeline: { length: number }[];
}

interface SummaryItem {
  userEmail: string;
  userSummary: string;
  contributionCounts: { type: string; count: number }[];
}

const StudentSummary = ({
  authorsByContributions,
  combinedTimeline,
  driveLink,
}: {
  authorsByContributions: Author[];
  combinedTimeline: any;
  driveLink: string;
}) => {
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const summaryLoaded = summary.map((i) => i.userSummary).length > 0;
  const driveId = driveLink.split("/d/")[1].split("/")[0];
  useEffect(() => {
    if (combinedTimeline) {
      fetch(`https://docs.google.com/document/d/${driveId}/export?format=txt`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          response.text().then((driveData) => {
            fetch("/api/Ai", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                gitData: combinedTimeline,
                driveData,
              }),
            }).then((response) => {
              response.json().then((data) => {
                setSummary(data.summary);
              });
            });
          });
        })
        .catch((error) => {
          fetch("/api/Ai", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              gitData: combinedTimeline,
              driveData:
                "Informar que não foi possível obter dados do google docs",
            }),
          }).then((response) => {
            response.json().then((data) => {
              setSummary(data.summary);
            });
          });
        });
    }
  }, [combinedTimeline, driveId]);

  console.log(summary);
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
        {authorsByContributions.map((author: any, index: number) => {
          const userSummary = summary?.find(
            (item: any) => item.userEmail === author.email
          );
          const userTextualSummary =
            userSummary?.userSummary || "Processando com IA...";

          if (!userSummary && summaryLoaded) return null;
          return (
            <Card key={index} className="max-w-sm">
              <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {author.name}
              </h5>
              <p className="font-normal text-gray-700 dark:text-gray-400">
                <strong>{author.timeline.length}</strong> commits feitos no
                projeto
              </p>
              <p className="font-normal text-gray-700 dark:text-gray-400 break-words">
                Email: {author.email}
              </p>
              <h1 className="font-bold">Resumo gerado por IA:</h1>
              <p>{userTextualSummary}</p>
              <DognutContributions userSummary={userSummary} />
            </Card>
          );
        })}
      </div>
      <div className="w-full flex justify-center mb-16">
        <div className="w-2/3">
          <BarchartContributions userSummary={summary} />
        </div>
      </div>
    </div>
  );
};

export default StudentSummary;
