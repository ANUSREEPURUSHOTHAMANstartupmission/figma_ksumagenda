// Define the Speaker, Event, and ResponseData interfaces
interface Speaker {
  name: string;
  designation: string;
  organisation: string;
  linkedin?: string;
  order: number;
  category: string;
  photo?: string;
}

interface Event {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  description: string | null;
  category: string;
  track: number;
  link: string | null;
  link_text: string | null;
  venue: string;
  speakers: {
    speaker?: Speaker[];
  };
}

interface ResponseData {
  agenda: {
    [date: string]: {
      'Main Stage'?: Event[]; // Use single quotes for property names with spaces
    };
  };
  categories: string[];
  venues: string[];
}

// Fetch data from the API
const fetchData = async () => {
  try {
    const response = await fetch('https://events.startupmission.in/api/event/huddle-global-2023/agenda/venue');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json() as ResponseData;
    console.log('Data:', data);

    // Load the Inter font before updating the template
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });

    // Update the Figma document with the fetched data
    updateFigmaDocument(data);
  } catch (error: any) {
    console.error('Error fetching data:', error.message);
  }
};

// Update the Figma document with the fetched data
const updateFigmaDocument = async (data: ResponseData) => {
  const currentPage = figma.currentPage;
  const textNodes: TextNode[] = [];

  // Loop through 'agenda' dates and create text nodes
  const agendaDates = Object.keys(data.agenda);
  for (let i = 0; i < agendaDates.length; i++) {
    const date = agendaDates[i];
    const mainStageEvents = data.agenda[date]['Main Stage'];

    if (mainStageEvents) {
      for (let j = 0; j < mainStageEvents.length; j++) {
        const event = mainStageEvents[j];

        // Get all text nodes in the current page
        const pageTextNodes = currentPage.findAll((node) => node.type === "TEXT") as TextNode[];

        // Create a text node
        const textNode = figma.createText();
        textNode.x = j * 200; // Adjust the positioning as needed
        textNode.y = i * 100; // Adjust the positioning as needed

        // Set the font for the text node
        textNode.fontName = { family: "Inter", style: "Regular" };

        // Set the text content
        let textContent = `Date: ${date}\nVenue: ${event.venue}\nCategory: ${event.category}\nName: #name\nDesignation: #designation\n`;

        // Add speaker details if available
        if (event.speakers) {
          const speakerCategories = Object.keys(event.speakers);

          for (const category of speakerCategories) {
            const speakers = (event.speakers as any)[category];

            if (speakers && speakers.length > 0) {
              // Customize the formatting of speaker details here
              textContent += `\n${category.charAt(0).toUpperCase() + category.slice(1)}s:\n`;

              for (const speaker of speakers) {
                // Check for markers like #name and #designation and replace them with actual data
                textContent = textContent
                  .replace('#name', speaker.name)
                  .replace('#designation', speaker.designation);

                // Add other marker checks as needed

                // Add the following block to load and display the speaker image
                if (speaker.photo) {
                  try {
                    const imageResponse = await fetch(speaker.photo);

                    if (!imageResponse.ok) {
                      throw new Error(`Failed to fetch image. Status: ${imageResponse.status}`);
                    }

                    const imageBuffer = await imageResponse.arrayBuffer();
                    const image = figma.createImage(new Uint8Array(imageBuffer));

                    // Create a frame node for each speaker
                    const frame = figma.createFrame();
                    frame.x = j * 200; // Adjust the positioning as needed
                    frame.y = i * 100; // Adjust the positioning as needed
                    frame.resize(200, 300); // Set the size of the frame

                    // Create a rectangle node to display the image
                    const rectangle = figma.createRectangle();
                    rectangle.resize(200, 200); // Set the size of the rectangle
                    rectangle.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: image.hash }];

                    // Add the rectangle node to the frame
                    frame.appendChild(rectangle);

                    // Create a text node for speaker details
                    const speakerDetailsText = figma.createText();
                    speakerDetailsText.x = 0; // Adjust the positioning as needed
                    speakerDetailsText.y = 200; // Adjust the positioning as needed
                    speakerDetailsText.characters = `Name: ${speaker.name}\nDesignation: ${speaker.designation}\nCategory: ${category}\nDetails: ${speaker.organisation}\n`;

                    // Add the text node to the frame
                    frame.appendChild(speakerDetailsText);

                    // Add the frame to the current page
                    figma.currentPage.appendChild(frame);
                  } catch (error) {
                    console.error('Error loading image:', (error as Error).message);
                  }
                }
              }
            }
          }
        }

        // Set the text content to the formatted content
        textNode.characters = textContent;

        // Add the text node to the list
        textNodes.push(textNode);
      }
    }
  }

  // Replace existing text nodes in the document with the updated ones
  textNodes.forEach((newTextNode) => {
    const existingTextNode = textNodes.find((node) => node.x === newTextNode.x && node.y === newTextNode.y);

    if (existingTextNode) {
      existingTextNode.characters = newTextNode.characters;
    } else {
      // Add the new text node if it doesn't exist
      currentPage.appendChild(newTextNode);
    }
  });

  // Ensure the nodes are visible on the canvas
  figma.viewport.scrollAndZoomIntoView(textNodes);

  // Set the selection to the created text nodes
  currentPage.selection = textNodes;
};

// Fetch data when the plugin is run
fetchData();
