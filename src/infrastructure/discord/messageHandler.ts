import { EmbedBuilder } from "discord.js";

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
    });

  return { embeds: [embed] };
};

export const createResponse = <T = string>(responseData: T) => {
  const fields: EmbedField<T>[] = [
    {
      name: "Response",
      value: responseData,
      inline: true,
    },
  ];

  return createEmbed("Response", "Pancake response:", fields);
};

export const createListResponse = <T = string>(responseData: T[]) => {
  const fields: EmbedField<string>[] = responseData.map((data, index) => ({
    name: `Item ${index + 1}`,
    value: String(data),
    inline: false,
  }));

  return createEmbed("Response List", "Here is the list of responses:", fields);
};
