﻿using Lumina;
using Lumina.Data;
using Lumina.Data.Files;
using PDPWebsite.FFXIV;
using SkiaSharp;
using System.Runtime.InteropServices;

namespace PDPWebsite.Services;

public class GameClient : IDisposable
{
    private readonly GameData _gameData;
    private readonly UniversalisClient _client;

    private List<Item> _marketItems = new();
    public IReadOnlyList<Item> MarketItems => _marketItems;

    private const string IconFileFormat = "ui/icon/{0:D3}000/{1}{2:D6}.tex";
    private const string IconHDFileFormat = "ui/icon/{0:D3}000/{1}{2:D6}_hr1.tex";

    public GameClient(UniversalisClient client)
    {
#if DEBUG
        var gameDataPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "SquareEnix", "FINAL FANTASY XIV - A Realm Reborn", "game", "sqpack");
#else
        var gameDataPath = Path.Combine(AppContext.BaseDirectory, "ffxiv", "sqpack");
#endif
        _gameData = new GameData(gameDataPath)
        {
            Options =
            {
                PanicOnSheetChecksumMismatch = false
            }
        };
        _client = client;
        LoadMarket().GetAwaiter().GetResult();
    }

    private async Task LoadMarket()
    {
        var ids = await _client.GetMarketItems();

        var items = _gameData.Excel.GetSheet<Lumina.Excel.GeneratedSheets.Item>(Language.English);
        if (items != null)
            foreach (var item in items)
            {
                if (ids.Contains(item.RowId))
                    _marketItems.Add(new Item(this)
                    {
                        Id = item.RowId,
                        Name = item.Name,
                        Singular = item.Singular,
                        Plural = item.Plural,
                        Icon = item.Icon
                    });
            }
    }

    public TexFile? GetTexFile(string path) => _gameData.GetFile<TexFile>(path);

    public void Dispose()
    {
    }
}