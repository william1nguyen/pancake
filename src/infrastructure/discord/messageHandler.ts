import { EmbedBuilder } from "discord.js";
import logger from "../shared/logger";

export interface EmbedField<T = string> {
  name: string;
  value: T;
  inline?: boolean;
}

export const createEmbed = <T = string>(
  title: string,
  description: string,
  fields: EmbedField<T>[],
) => {
  try {
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle(title)
      .setDescription(description)
      .addFields(
        fields.map((field) => ({
          name: field.name,
          value: String(field.value),
          inline: field.inline ?? false,
        })),
      )
      .setTimestamp()
      .setFooter({
        text: `Status updated ${new Date().toLocaleString()}`,
        iconURL:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTExqxRATJj7WIJbB3FmdJAA-GykdJjWnivkw&s",
      });

    return { embeds: [embed] };
  } catch (err) {
    console.error("Error creating embed:", err);
    throw err;
  }
};

export const createResponse = <T = string>(responseData: T) => {
  const fields: EmbedField<string>[] = [
    {
      name: "Response",
      value: `\`\`\`json\n${JSON.stringify(responseData, null, 2)}\n\`\`\``,
      inline: true,
    },
  ];

  return createEmbed("Pancake Response", "Here is response:", fields);
};

export const createListResponse = <T = string>(responseData: T[]) => {
  const fields: EmbedField<string>[] = responseData.map((data, index) => ({
    name: `${index + 1}`,
    value: `\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``,
    inline: false,
  }));

  return createEmbed("Pancake Response List", "Here is response:", fields);
};
