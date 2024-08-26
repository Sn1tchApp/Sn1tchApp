"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Timeline, Card } from "flowbite-react";

const getData = async (url: string, token: string) => {
  const maxPage = 1000;
  const authors: any = {};
  const repoData = url.replace("https://github.com/", "").split("/");
  const [owner, repo] = repoData;

  for (let page = 1; page < maxPage; page++) {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits?page=${page}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    const { data } = response;
    if (!data.length) {
      break;
    }
    data.forEach(({ commit }: any) => {
      const { author, message } = commit;
      if (authors[author.email]) {
        authors[author.email] = {
          name: author.name,
          timeline: [
            ...authors[author.email].timeline,
            { date: author.date, message },
          ],
        };
      } else {
        authors[author.email] = {
          message: message,
          name: author.name,
          timeline: [{ date: author.date, message }],
        };
      }
    });
  }

  console.log("authors", authors);
  return authors;
};

export default function Page() {
  const [authorsData, setAuthorsData] = useState<any>([]);

  const searchParams = useSearchParams();
  const githubLink = searchParams.get("githubLink") || "";
  const accessToken = searchParams.get("accessToken") || "";

  useEffect(() => {
    getData(githubLink, accessToken).then((authors) => {
      const authorsAsArray = Object.keys(authors).map((email) => ({
        email,
        ...authors[email],
      }));
      setAuthorsData(authorsAsArray);
    });
  }, [githubLink, accessToken]);

  const combinedTimeline = authorsData.flatMap((author: any) =>
    author.timeline.map((timelinePoint: any) => ({
      date: timelinePoint.date,
      message: timelinePoint.message,
      name: author.name,
      email: author.email,
    }))
  );

  // Sort the combined timeline by date
  combinedTimeline.sort(
    (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const authorsByContribuitions = authorsData.sort(
    (a: any, b: any) => b.timeline.length - a.timeline.length
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-8 text-gray-900">
        Dados do projeto {githubLink.replace("https://github.com/", "")}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
        {authorsByContribuitions.map((author: any, index: number) => (
          <Card key={index} className="max-w-sm">
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {author.name}
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">
              <strong>{author.timeline.length}</strong> commits feitos no
              projeto
            </p>
            <p className="font-normal text-gray-700 dark:text-gray-400">
              Email: {author.email}
            </p>
          </Card>
        ))}
      </div>
      <Card>
        <Timeline>
          {combinedTimeline.map((entry: any, index: number) => {
            const date = new Date(entry.date);
            const options = {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            };

            const localeDateString = date.toLocaleDateString(
              "pt-BR",
              options as any
            );

            return (
              <Timeline.Item key={index}>
                <Timeline.Point />
                <Timeline.Content>
                  <Timeline.Time>{localeDateString}</Timeline.Time>
                  <Timeline.Title>{entry.name}</Timeline.Title>
                  <Timeline.Body style={{ maxWidth: "20vw" }}>
                    Mensagem de commit: {entry.message}
                  </Timeline.Body>
                  <Timeline.Body>Email: {entry.email}</Timeline.Body>
                </Timeline.Content>
              </Timeline.Item>
            );
          })}
        </Timeline>
      </Card>
    </div>
  );
}
