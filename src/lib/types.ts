export type AutoTags = {
objectTags: string[];
sceneTags: string[];
emotionTags: string[];
ocr: string[]; // extracted words/lines
};


export type MediaItem = {
id: string;
title: string;
thumbUrl: string;
tags: string[]; // unified (editable)
auto: AutoTags; // raw auto-tags (redactable)
};

export type LibraryItem = {
  id: string;
  src: string;        // data URL for the selected image
  tags: string[];
  title?: string;
  createdAt: string;
};