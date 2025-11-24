Your goal is to convert the markdown provided as input into a cool MDX file. 
You have access to all the components in the components in the /website/src/Components/pillars/shared
Write everything in the MDX file passed in the input

You can take a look at the pages in staticPages/pillars for an example about the layout etc (e.g. context.mdx)

For the images, when in the md there is an image, add: 
<div className="mb-12 -mx-6 md:-mx-8 lg:-mx-12">
  <img
    src="/images/pillars/todo.png"
    alt="Agent"
    className="w-full h-auto rounded-lg shadow-2xl"
  />
</div>

I'll add the image later manually

Use the right component based on the context. Structure everything in a very cool way.
Keep in mind that the idea is to configure the content so that is very readable.