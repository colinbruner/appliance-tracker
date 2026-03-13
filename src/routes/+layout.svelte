<slot />

<style>
  :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    background: #f1f5f9;
    color: #1e293b;
    min-height: 100vh;
  }

  :global(button) {
    cursor: pointer;
    font-family: inherit;
  }

  :global(input, select, textarea) {
    font-family: inherit;
  }
</style>
