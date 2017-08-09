module View exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
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
            [ case model.current_release of
                Nothing ->
                    div []
                        [ text "Please select a version or enter your version number below."
                        , Html.form [ onSubmit <| Select model.manual_version ]
                            [ input
                                [ onInput ManualVersion
                                , value model.manual_version
                                ]
                                []
                            , button
                                [ class "btn btn-default" ]
                                [ text "Select" ]
                            ]
                        ]

                Just version ->
                    div []
                        [ h1 [] [ text <| "Selected: " ++ version ]
                        , button [ type_ "button", class "close", onClick DismissVersion ]
                            [ span [ class "glyphicon glyphicon-remove" ] []
                            ]
                        , spinner
                        ]
            ]
        , div [ class "col-sm-3" ]
            [ releasesMenu model.releases ]
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


releasesMenu : List Version -> Html Msg
releasesMenu releases =
    div [ class "panel panel-default" ]
        [ div [ class "panel-heading" ] [ strong [] [ text "Firefox Releases" ] ]
        , div []
            [ let
                releaseItem version =
                    li [] [ a [ onClick <| Select version ] [ text version ] ]
              in
                ul [] <|
                    List.map releaseItem releases
            ]
        ]


spinner : Html Msg
spinner =
    div [ class "loader" ] []
