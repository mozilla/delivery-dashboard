module View exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Types exposing (..)


view : Model -> Html Msg
view model =
    div [ class "container-fluid" ]
        [ headerView model
        , mainView model
        ]


mainView : Model -> Html Msg
mainView model =
    div [ class "row" ]
        [ div [ class "col-sm-9" ]
            [ spinner ]
        ]


headerView : Model -> Html Msg
headerView model =
    nav
        [ class "navbar navbar-default" ]
        [ div
            [ class "container-fluid" ]
            [ div
                [ class "navbar-header" ]
                [ a [ class "navbar-brand", href "#" ] [ text "Delivery Dashboard" ] ]
            ]
        ]


spinner : Html Msg
spinner =
    div [ class "loader" ] []
