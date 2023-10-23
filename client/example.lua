RegisterCommand("testmenu", function()
    local menuData = {
        title = "CMenu",
        align = "center", -- left, right, center
        closeButton = true,
        searchBar = true,
        closeFunction = function()
            print("Menu closed")
        end,
        {
            name = "Submenu Button",
            --[[ image = "image url goes here", ]]
            action = function()
                print("Button 1 clicked")
            end,
            hoverAction = function()
                print("Button 1 hovered")
            end,
            requirements = {
                {
                    item = "weapon_revolver_cattleman",
                    amount = 5
                },
                {
                    item = "weapon_revolver_cattleman",
                    amount = 5
                }
            },
            information = [[
                        <h1>Welcome to CMenu</h1>
                        hello
                        hello
                        hello
                        hello
                        hello
                        hello
                    ]],
            backFunction = function()
                print("Back button clicked")
            end,
            subMenu = {
                {
                    name = "Sub Button 1",
                    action = function() print("Sub Button 1 clicked") end,
                    hoverAction = function() print("Sub Button 1 hovered") end,
                    image = "https://i.imgur.com/750nsAi.png",
                    requirements = {
                        {
                            item = "weapon_revolver_cattleman",
                            amount = 5
                        },
                        {
                            item = "weapon_revolver_cattleman",
                            amount = 5
                        }
                    },
                    information = [[
                                <h1>I am gay</h1>
                                hello
                                hello
                                hello
                                hello
                                hello
                                hello
                            ]],
                },
                -- Add other subButtons similarly
            }
        },
        {
            name = "Form Button 2",
            image = "image url goes here",
            action = function()
                print("Button 2 clicked")
            end,
            hoverAction = function()
                print("Button 2 hovered")
            end,
            requirements = {
                {
                    item = "weapon_revolver_cattleman",
                    amount = 5
                },
                {
                    item = "weapon_revolver_cattleman",
                    amount = 5
                }
            },
            information = [[
                        <h1>I am gay</h1>
                        hello
                        hello
                        hello
                        hello
                        hello
                        hello
                    ]],
            backFunction = function()
                print("Back button clicked")
            end,
            form = {
                fields = {
                    {
                        image = "http://femga.com/images/samples/ui_textures_no_bg/inventory_items/ammo_arrow.png",
                        type = "image"
                    }, -- inventory image and url support
                    {
                        type = "divider",
                    },
                    {
                        id = "name",
                        label = "Name",
                        placeholder = "Name of guy",
                        type = "short-text",
                        autofill = "John Doe", -- optional
                        readonly = false,
                    },                         -- returns false if no entry
                    {
                        id = "number",
                        label = "Number",
                        placeholder = "Number o guy",
                        type = "number",
                        autofill = 1, -- optional
                        readonly = false,
                    },                -- returns false if no entry
                    {
                        id = "choice",
                        label = "Choice",
                        type = "options",
                        searchbar = true,
                        options = {
                            { value = "choice1", label = "guy 1" },
                            { value = "choice2", label = "guy 2" }
                        }
                    }, -- returns choice1 by default
                    {
                        id = "description",
                        label = "Description",
                        placeholder = "Desc of the guy",
                        type = "long-text",
                        autofill = "John Doe", -- optional
                        readonly = false,
                    },                         -- returns "" if empty
                    {
                        id = "prompt",
                        label = "Prompt",
                        type = "prompt",
                        yesLabel = "Yes?",
                        noLabel = "No?",
                        default = false, -- optional
                    },                   -- returns true/false (default is false)
                    {
                        id = "entries",
                        label = "Entries",
                        type = "entries",
                        entries = {
                            { value = "entry1", label = "entry 1" },
                            { value = "entry2", label = "entry 2" }
                        }
                    }, -- returns {} by default
                    {
                        id = "slider",
                        label = "Slider",
                        type = "slider",
                        default = 1,
                        slideroptions = {
                            { value = 1 --[[ , action = function() print("Slider 1 hovered") end ]] },
                            { value = 2 --[[ , action = function() print("Slider 2 hovered") end ]] }
                        },
                        generalFunction = function(sliderid) print("Slider " .. sliderid .. " hovered") end
                    }, -- slider for shit, insert slider options through local loop
                    {
                        type = "divider",
                    },
                    {
                        label = "Helloooo VIETNAM!",
                        type = "text",
                    }, -- put whatever text you want here
                    {
                        type = "button",
                        label = "Button",
                        action = function(data)
                            print("Button clicked")
                            print(json.encode(data, { indent = true }))
                        end,
                        hoverAction = function()
                            print("Button hovered")
                        end
                    }, -- Miscellaneous buttons
                    {
                        type = "divider",
                    },
                },
                submitLabel = "Send Info",
                submitAction = function(formData)
                    -- Your logic here for handling form data
                    print(json.encode(formData, { indent = true }))
                end
            }
        },
    }
    exports.cmenu:OpenMenu(menuData)
end, false)
